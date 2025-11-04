import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Check file size (limit to 10MB for images)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB. Please compress your image or use a smaller file.' 
      }, { status: 413 })
    }
    
    // Check file type - only images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Only image files are allowed.' 
      }, { status: 400 })
    }
    
    console.log(`Uploading image: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          resource_type: 'image',
          folder: 'r3t-podcast/images',
          public_id: `image_${Date.now()}`,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Upload successful:', result?.secure_url)
            resolve(result)
          }
        }
      )
    })
    
    return NextResponse.json({ 
      success: true, 
      url: (result as any).secure_url,
      public_id: (result as any).public_id
    })
  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('413')) {
        return NextResponse.json({ 
          error: 'File too large. Please try a smaller image file (under 10MB).' 
        }, { status: 413 })
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Upload timeout. Please try again with a smaller file.' 
        }, { status: 408 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload image. Please try again.' 
    }, { status: 500 })
  }
}

