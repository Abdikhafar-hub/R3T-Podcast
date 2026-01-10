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
const videosExamplePath = path.join(process.cwd(), 'data', 'videos.json.example')

// Helper function to ensure videos file exists
function ensureVideosFile() {
  const dataDir = path.dirname(videosFilePath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  if (!fs.existsSync(videosFilePath)) {
    // Initialize from example file if it exists
    if (fs.existsSync(videosExamplePath)) {
      fs.copyFileSync(videosExamplePath, videosFilePath)
    } else {
      // Create empty array if no example file
      fs.writeFileSync(videosFilePath, JSON.stringify([], null, 2))
    }
  }
}

// Helper function to read videos
function readVideos() {
  try {
    ensureVideosFile()
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const parsed = JSON.parse(videosData)
    // Ensure it's an array
    if (Array.isArray(parsed)) {
      return parsed
    } else {
      console.warn('Videos file does not contain an array, returning empty array')
      return []
    }
  } catch (error) {
    console.error('Error reading videos file:', error)
    // Return empty array on error instead of throwing
    return []
  }
}

// Helper function to write videos
function writeVideos(videos: any[]) {
  ensureVideosFile()
  fs.writeFileSync(videosFilePath, JSON.stringify(videos, null, 2))
}

export async function GET() {
  try {
    const videos = readVideos()
    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(videos) ? videos : [])
  } catch (error) {
    console.error('Error reading videos:', error)
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, src, featured = true, public_id } = await request.json()
    
    // Read current videos
    const videos = readVideos()
    
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
    writeVideos(videos)
    
    return NextResponse.json({ success: true, video: newVideo })
  } catch (error) {
    console.error('Error adding video:', error)
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
    const videos = readVideos()
    
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
    writeVideos(updatedVideos)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating video:', error)
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
    const videos = readVideos()
    
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
    writeVideos(filteredVideos)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
