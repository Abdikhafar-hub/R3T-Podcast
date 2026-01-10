import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CMS_DATA_PATH = path.join(process.cwd(), 'data', 'cms-data.json')
const CMS_DATA_EXAMPLE_PATH = path.join(process.cwd(), 'data', 'cms-data.json.example')

// Helper function to get empty CMS structure
function getEmptyCmsData() {
  return {
    hero: { slides: [] },
    about: { title: '', content: [], image: '', imageAlt: '' },
    hosts: { title: '', hosts: [] },
    producer: { title: '', name: '', image: '', bio: '' },
    testimonials: { title: '', subtitle: '', testimonials: [] },
    partners: { title: '', subtitle: '', platforms: [] },
    contact: { title: '', subtitle: '', email: '', socialLinks: [] },
    footer: { logo: '', description: '', email: '', location: '', quickLinks: [], socialLinks: [] },
    navbar: { logo: '', navLinks: [], ctaText: '', ctaLink: '' }
  }
}

export async function GET() {
  try {
    // Try to read the main data file first
    if (fs.existsSync(CMS_DATA_PATH)) {
      try {
        const data = fs.readFileSync(CMS_DATA_PATH, 'utf8')
        const parsed = JSON.parse(data)
        // Validate it's an object (not an error)
        if (parsed && typeof parsed === 'object' && !parsed.error) {
          return NextResponse.json(parsed)
        }
      } catch (parseError) {
        console.error('Error parsing CMS data file:', parseError)
        // Fall through to return empty structure
      }
    }
    
    // Fallback to example file if main file doesn't exist or is invalid
    if (fs.existsSync(CMS_DATA_EXAMPLE_PATH)) {
      try {
        const data = fs.readFileSync(CMS_DATA_EXAMPLE_PATH, 'utf8')
        const parsed = JSON.parse(data)
        if (parsed && typeof parsed === 'object' && !parsed.error) {
          return NextResponse.json(parsed)
        }
      } catch (parseError) {
        console.error('Error parsing CMS example file:', parseError)
        // Fall through to return empty structure
      }
    }
    
    // If neither exists or both are invalid, return empty structure
    console.warn('CMS data file not found or invalid, returning empty structure')
    return NextResponse.json(getEmptyCmsData())
  } catch (error) {
    console.error('Error reading CMS data:', error)
    // Always return valid structure, never an error object
    return NextResponse.json(getEmptyCmsData())
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { section, data } = body

    // Ensure data directory exists
    const dataDir = path.dirname(CMS_DATA_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Read current data or initialize from example file
    let currentData: any
    if (fs.existsSync(CMS_DATA_PATH)) {
      currentData = JSON.parse(fs.readFileSync(CMS_DATA_PATH, 'utf8'))
    } else if (fs.existsSync(CMS_DATA_EXAMPLE_PATH)) {
      // Initialize from example file if main file doesn't exist
      currentData = JSON.parse(fs.readFileSync(CMS_DATA_EXAMPLE_PATH, 'utf8'))
    } else {
      // Initialize with empty structure
      currentData = getEmptyCmsData()
    }
    
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
