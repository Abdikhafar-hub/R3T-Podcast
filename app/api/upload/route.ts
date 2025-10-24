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
    
    // Check file size (limit to 200MB for now to avoid Cloudinary limits)
    const maxSize = 200 * 1024 * 1024 // 200MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 200MB. Please compress your video or use a smaller file.' 
      }, { status: 413 })
    }
    
    // Check file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ 
        error: 'Only video files are allowed.' 
      }, { status: 400 })
    }
    
    console.log(`Uploading file: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Use Cloudinary's upload with minimal options to avoid size limits
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          resource_type: 'video',
          folder: 'r3t-podcast/videos',
          public_id: `video_${Date.now()}`,
          // Minimal transformations to avoid size issues
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
          error: 'File too large. Please try a smaller video file (under 200MB).' 
        }, { status: 413 })
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Upload timeout. Please try again with a smaller file.' 
        }, { status: 408 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload file. Please try again with a smaller file.' 
    }, { status: 500 })
  }
}
