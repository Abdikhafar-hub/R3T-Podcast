import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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
    const { title, src, featured = true } = await request.json()
    
    // Read current videos
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const videos = JSON.parse(videosData)
    
    // Add new video
    const newVideo = {
      id: Date.now().toString(),
      title,
      src,
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
    const { id, featured } = await request.json()
    
    if (!id || typeof featured !== 'boolean') {
      return NextResponse.json({ error: 'Video ID and featured status required' }, { status: 400 })
    }
    
    // Read current videos
    const videosData = fs.readFileSync(videosFilePath, 'utf8')
    const videos = JSON.parse(videosData)
    
    // Update video status
    const updatedVideos = videos.map((video: any) => 
      video.id === id ? { ...video, featured } : video
    )
    
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
    
    // Remove video
    const filteredVideos = videos.filter((video: any) => video.id !== id)
    
    // Write back to file
    fs.writeFileSync(videosFilePath, JSON.stringify(filteredVideos, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
