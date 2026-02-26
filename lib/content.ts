import "server-only"
import fs from "node:fs"
import path from "node:path"

export interface HeroSlide {
  id?: string
  image?: string
  title?: string
  subtitle?: string
  cta?: string
  ctaLink?: string
}

export interface HostProfile {
  id?: string
  name?: string
  image?: string
  bio?: string
}

export interface SocialLink {
  name?: string
  href?: string
  icon?: string
  color?: string
  logo?: string
}

export interface PartnerPlatform {
  name?: string
  url?: string
  icon?: string
  color?: string
  logo?: string
}

export interface CmsData {
  hero?: {
    slides?: HeroSlide[]
  }
  about?: {
    title?: string
    content?: string[]
    image?: string
    imageAlt?: string
  }
  hosts?: {
    title?: string
    hosts?: HostProfile[]
  }
  producer?: {
    title?: string
    name?: string
    image?: string
    bio?: string
  }
  partners?: {
    title?: string
    subtitle?: string
    platforms?: PartnerPlatform[]
  }
  contact?: {
    title?: string
    subtitle?: string
    email?: string
    socialLinks?: SocialLink[]
  }
  footer?: {
    logo?: string
    description?: string
    email?: string
    location?: string
    quickLinks?: Array<{ name?: string; href?: string }>
    socialLinks?: SocialLink[]
  }
  navbar?: {
    logo?: string
    navLinks?: Array<{ href?: string; label?: string }>
    ctaText?: string
    ctaLink?: string
  }
}

export interface Video {
  id: string
  title: string
  description?: string
  src: string
  uploadDate: string
  featured: boolean
  public_id?: string | null
}

const DATA_DIR = path.join(process.cwd(), "data")
const CMS_DATA_FILES = [
  path.join(DATA_DIR, "cms-data.json"),
  path.join(DATA_DIR, "cms-data.json.example"),
]
const VIDEO_DATA_FILES = [
  path.join(DATA_DIR, "videos.json"),
  path.join(DATA_DIR, "videos.json.example"),
]

const EMPTY_CMS_DATA: CmsData = {
  hero: { slides: [] },
  about: { title: "", content: [], image: "", imageAlt: "" },
  hosts: { title: "", hosts: [] },
  producer: { title: "", name: "", image: "", bio: "" },
  partners: { title: "", subtitle: "", platforms: [] },
  contact: { title: "", subtitle: "", email: "", socialLinks: [] },
  footer: { logo: "", description: "", email: "", location: "", quickLinks: [], socialLinks: [] },
  navbar: { logo: "", navLinks: [], ctaText: "", ctaLink: "" },
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null
    }

    const raw = fs.readFileSync(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch (error) {
    console.error(`Failed to read JSON file: ${filePath}`, error)
    return null
  }
}

function readFirstValidJson<T>(filePaths: string[], fallback: T): T {
  for (const filePath of filePaths) {
    const parsed = readJsonFile<unknown>(filePath)

    if (parsed !== null) {
      return parsed as T
    }
  }

  return fallback
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function normalizeCmsData(raw: unknown): CmsData {
  if (!isObject(raw)) {
    return EMPTY_CMS_DATA
  }

  const hero = isObject(raw.hero) ? raw.hero : {}
  const about = isObject(raw.about) ? raw.about : {}
  const hosts = isObject(raw.hosts) ? raw.hosts : {}
  const producer = isObject(raw.producer) ? raw.producer : {}
  const partners = isObject(raw.partners) ? raw.partners : {}
  const contact = isObject(raw.contact) ? raw.contact : {}
  const footer = isObject(raw.footer) ? raw.footer : {}
  const navbar = isObject(raw.navbar) ? raw.navbar : {}

  return {
    hero: {
      ...EMPTY_CMS_DATA.hero,
      ...hero,
      slides: toArray<HeroSlide>(hero.slides),
    },
    about: {
      ...EMPTY_CMS_DATA.about,
      ...about,
      content: toArray<string>(about.content),
    },
    hosts: {
      ...EMPTY_CMS_DATA.hosts,
      ...hosts,
      hosts: toArray<HostProfile>(hosts.hosts),
    },
    producer: {
      ...EMPTY_CMS_DATA.producer,
      ...producer,
    },
    partners: {
      ...EMPTY_CMS_DATA.partners,
      ...partners,
      platforms: toArray<PartnerPlatform>(partners.platforms),
    },
    contact: {
      ...EMPTY_CMS_DATA.contact,
      ...contact,
      socialLinks: toArray<SocialLink>(contact.socialLinks),
    },
    footer: {
      ...EMPTY_CMS_DATA.footer,
      ...footer,
      quickLinks: toArray<{ name?: string; href?: string }>(footer.quickLinks),
      socialLinks: toArray<SocialLink>(footer.socialLinks),
    },
    navbar: {
      ...EMPTY_CMS_DATA.navbar,
      ...navbar,
      navLinks: toArray<{ href?: string; label?: string }>(navbar.navLinks),
    },
  }
}

function isVideo(value: unknown): value is Video {
  if (!isObject(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.src === "string" &&
    typeof value.uploadDate === "string" &&
    typeof value.featured === "boolean"
  )
}

function sortByUploadDateDesc(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => {
    const aTime = Date.parse(a.uploadDate)
    const bTime = Date.parse(b.uploadDate)

    const safeATime = Number.isNaN(aTime) ? 0 : aTime
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime

    return safeBTime - safeATime
  })
}

export function getCmsData(): CmsData {
  const raw = readFirstValidJson<unknown>(CMS_DATA_FILES, EMPTY_CMS_DATA)
  return normalizeCmsData(raw)
}

export function getVideos(): Video[] {
  const raw = readFirstValidJson<unknown>(VIDEO_DATA_FILES, [])

  if (!Array.isArray(raw)) {
    return []
  }

  return sortByUploadDateDesc(raw.filter(isVideo))
}

export function getFeaturedVideos(limit?: number): Video[] {
  const featured = getVideos().filter((video) => video.featured)

  if (typeof limit === "number" && limit > 0) {
    return featured.slice(0, limit)
  }

  return featured
}

export function getLatestVideoDate(): Date | null {
  for (const video of getVideos()) {
    const timestamp = Date.parse(video.uploadDate)

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp)
    }
  }

  return null
}

