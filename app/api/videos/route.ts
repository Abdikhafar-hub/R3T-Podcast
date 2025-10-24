import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const videosFilePath = path.join(process.cwd(), 'data', 'videos.json')

export async function GET() {
  try {
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const videos = JSON.parse(videosData)
    return NextResponse.json(videos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, src, featured = true, public_id } = await request.json()
    
    // Read current videos
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const videos = JSON.parse(videosData)
    
    // Add new video
    const newVideo = {
      id: Date.now().toString(),
      title,
      description: description || "",
      src,
      public_id: public_id || null, // Store Cloudinary public_id for deletion
      uploadDate: new Date().toISOString().split('T')[0],
      featured
    }
    
    videos.push(newVideo)
    
    // Write back to file
    fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2))
    
    return NextResponse.json({ success: true, video: newVideo })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, featured } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }
    
    // Read current videos
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const videos = JSON.parse(videosData)
    
    // Update video with provided fields
    const updatedVideos = videos.map((video: any) => {
      if (video.id === id) {
        return {
          ...video,
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(featured !== undefined && { featured })
        }
      }
      return video
    })
    
    // Write back to file
    fs.writeFileSync(videosFilePath, JSON.stringify(updatedVideos, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }
    
    // Read current videos
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const videos = JSON.parse(videosData)
    
    // Find the video to delete
    const videoToDelete = videos.find((video: any) => video.id === id)
    
    // Delete from Cloudinary if it has a public_id
    if (videoToDelete && videoToDelete.public_id) {
      try {
        await cloudinary.uploader.destroy(videoToDelete.public_id, {
          resource_type: 'video'
        })
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError)
        // Continue with local deletion even if Cloudinary fails
      }
    }
    
    // Remove video from local data
    const filteredVideos = videos.filter((video: any) => video.id !== id)
    
    // Write back to file
    fs.writeFileSync(videosFilePath, JSON.stringify(filteredVideos, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
