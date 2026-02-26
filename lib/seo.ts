import type { Metadata } from "next"

export const SITE_NAME = "Roots, Routes & Real Talk (R3T)"
export const SITE_SHORT_NAME = "R3T Podcast"
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://rootsroutesrealtalk.com")
export const DEFAULT_SITE_DESCRIPTION =
  "Roots, Routes & Real Talk (R3T) is a podcast about work, life, growth, and honest conversations with humor, music, and real stories."
export const DEFAULT_OG_IMAGE = "/r3t-logo.png"

export const DEFAULT_KEYWORDS = [
  "R3T podcast",
  "Roots Routes Real Talk",
  "podcast",
  "real conversations",
  "work and life podcast",
  "personal growth conversations",
  "Serufusa Sekidde",
  "Hewan Wole",
]

export function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

export function toAbsoluteUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined
  }

  const value = url.trim()

  if (!value || value.startsWith("#")) {
    return undefined
  }

  try {
    return new URL(value, SITE_URL).toString()
  } catch {
    return undefined
  }
}

export function isHttpUrl(url?: string | null): boolean {
  if (!url) {
    return false
  }

  return /^https?:\/\//i.test(url.trim())
}

export function isLikelySocialProfileUrl(url?: string | null): boolean {
  if (!isHttpUrl(url)) {
    return false
  }

  try {
    const parsed = new URL(url as string)
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase()
    const path = parsed.pathname.toLowerCase()

    if (host === "chatgpt.com") {
      return false
    }

    const allowedHosts = new Set([
      "instagram.com",
      "tiktok.com",
      "youtube.com",
      "youtu.be",
      "linkedin.com",
      "x.com",
      "twitter.com",
      "facebook.com",
      "spotify.com",
      "open.spotify.com",
      "podcasts.apple.com",
      "music.amazon.com",
    ])

    if (!allowedHosts.has(host)) {
      return false
    }

    // Avoid content links that are not brand/profile pages.
    if (host === "youtube.com" && path === "/watch") {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function truncateForMeta(text?: string | null, maxLength = 160): string {
  const normalized = (text || "").replace(/\s+/g, " ").trim()

  if (!normalized) {
    return DEFAULT_SITE_DESCRIPTION
  }

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export function uniqueStrings(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.map((value) => (value || "").trim()).filter(Boolean))]
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

type BuildPageMetadataInput = {
  title: string
  description: string
  path: string
  image?: string | null
  keywords?: Array<string | undefined | null>
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  keywords = [],
}: BuildPageMetadataInput): Metadata {
  const pageDescription = truncateForMeta(description)
  const canonical = path.startsWith("/") ? path : `/${path}`
  const absoluteImage = toAbsoluteUrl(image || DEFAULT_OG_IMAGE) || `${SITE_URL}${DEFAULT_OG_IMAGE}`
  const fullTitle = `${title} | ${SITE_NAME}`

  return {
    title,
    description: pageDescription,
    alternates: {
      canonical,
    },
    keywords: uniqueStrings([...DEFAULT_KEYWORDS, ...keywords]),
    openGraph: {
      type: "website",
      url: toAbsoluteUrl(canonical) || SITE_URL,
      siteName: SITE_NAME,
      title: fullTitle,
      description: pageDescription,
      images: [
        {
          url: absoluteImage,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription,
      images: [absoluteImage],
    },
  }
}
