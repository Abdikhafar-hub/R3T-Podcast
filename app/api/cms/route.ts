import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CMS_DATA_PATH = path.join(process.cwd(), 'data', 'cms-data.json')
const CMS_DATA_EXAMPLE_PATH = path.join(process.cwd(), 'data', 'cms-data.json.example')

export async function GET() {
  try {
    // Try to read the main data file first
    if (fs.existsSync(CMS_DATA_PATH)) {
      const data = fs.readFileSync(CMS_DATA_PATH, 'utf8')
      return NextResponse.json(JSON.parse(data))
    }
    
    // Fallback to example file if main file doesn't exist
    if (fs.existsSync(CMS_DATA_EXAMPLE_PATH)) {
      const data = fs.readFileSync(CMS_DATA_EXAMPLE_PATH, 'utf8')
      return NextResponse.json(JSON.parse(data))
    }
    
    // If neither exists, return empty structure
    console.warn('CMS data file not found, returning empty structure')
    return NextResponse.json({
      hero: { slides: [] },
      about: { title: '', content: [], image: '', imageAlt: '' },
      hosts: { title: '', hosts: [] },
      producer: { title: '', name: '', image: '', bio: '' },
      testimonials: { title: '', subtitle: '', testimonials: [] },
      partners: { title: '', subtitle: '', platforms: [] },
      contact: { title: '', subtitle: '', email: '', socialLinks: [] },
      footer: { logo: '', description: '', email: '', location: '', quickLinks: [], socialLinks: [] },
      navbar: { logo: '', navLinks: [], ctaText: '', ctaLink: '' }
    })
  } catch (error) {
    console.error('Error reading CMS data:', error)
    return NextResponse.json({ error: 'Failed to read CMS data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, data } = body

    // Read current data
    const currentData = JSON.parse(fs.readFileSync(CMS_DATA_PATH, 'utf8'))
    
    // Update specific section
    currentData[section] = data
    
    // Write back to file
    fs.writeFileSync(CMS_DATA_PATH, JSON.stringify(currentData, null, 2))
    
    return NextResponse.json({ success: true, message: `${section} section updated successfully` })
  } catch (error) {
    console.error('Error updating CMS data:', error)
    return NextResponse.json({ error: 'Failed to update CMS data' }, { status: 500 })
  }
}
