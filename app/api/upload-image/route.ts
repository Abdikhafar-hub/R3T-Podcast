import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Route segment config - increase body size limit and duration for large files
export const runtime = 'nodejs'
export const maxDuration = 600 // 10 minutes for large file uploads

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing')
      return NextResponse.json({ 
        error: 'Server configuration error. Please contact the administrator.' 
      }, { status: 500 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Allow large files - check Cloudinary limits instead (typically 10MB for free, 100MB+ for paid)
    // No size restriction on our end - let Cloudinary handle it
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
    console.log(`Uploading image: ${file.name}, Size: ${fileSizeMB}MB`)
    
    // Check file type - only images
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Only image files are allowed.' 
      }, { status: 400 })
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to Cloudinary with extended timeout for large files
    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
        {
          resource_type: 'image',
          folder: 'r3t-podcast/images',
          public_id: `image_${Date.now()}`,
          quality: 'auto',
          fetch_format: 'auto',
          timeout: 300000, // 5 minutes timeout for large files
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

    // Extended timeout wrapper for large file uploads
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout. The file may be very large or the connection is slow.')), 600000) // 10 minutes total timeout
    })

    const result = await Promise.race([uploadPromise, timeoutPromise])
    
    return NextResponse.json({ 
      success: true, 
      url: (result as any).secure_url,
      public_id: (result as any).public_id
    })
  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('413') || error.message.includes('too large')) {
        return NextResponse.json({ 
          error: 'File upload rejected. This may be due to Cloudinary account limits. Check your Cloudinary plan for maximum file size limits.' 
        }, { status: 413 })
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Upload timeout. Large files may take several minutes. Please try again or check your connection.' 
        }, { status: 408 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload image. Please try again.' 
    }, { status: 500 })
  }
}

