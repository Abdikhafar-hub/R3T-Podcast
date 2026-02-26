import type { Metadata } from "next"
import Hero from "@/components/hero"
import About from "@/components/about"
import Hosts from "@/components/hosts"
import Producer from "@/components/producer"
import Videos from "@/components/videos"
import Partners from "@/components/partners"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"
import { SeoPageLinks } from "@/components/seo/page-shell"
import { getCmsData, getFeaturedVideos, type CmsData, type Video } from "@/lib/content"
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  isLikelySocialProfileUrl,
  safeJsonLd,
  toAbsoluteUrl,
  truncateForMeta,
  uniqueStrings,
} from "@/lib/seo"

export const revalidate = 3600

type HomeSeoPayload = {
  cms: CmsData
  featuredVideos: Video[]
  description: string
  primaryImageUrl: string
  logoUrl: string
  hostNames: string[]
  sameAs: string[]
  email?: string
  title: string
}

function pickFirstNonEmpty(values: Array<string | undefined | null>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim())?.trim()
}

function getHomeSeoPayload(): HomeSeoPayload {
  const cms = getCmsData()
  const featuredVideos = getFeaturedVideos(8)

  const heroSubtitle = cms.hero?.slides?.[0]?.subtitle
  const footerDescription = cms.footer?.description
  const aboutParagraph = (cms.about?.content || []).find((entry) => typeof entry === "string" && entry.trim())
  const description = truncateForMeta(heroSubtitle || footerDescription || aboutParagraph || DEFAULT_SITE_DESCRIPTION)

  const logoUrl = toAbsoluteUrl(cms.footer?.logo || cms.navbar?.logo || DEFAULT_OG_IMAGE) || `${SITE_URL}${DEFAULT_OG_IMAGE}`
  const primaryImageUrl =
    toAbsoluteUrl(cms.hero?.slides?.[0]?.image || cms.about?.image || cms.producer?.image || cms.footer?.logo || DEFAULT_OG_IMAGE) ||
    logoUrl

  const hostNames = uniqueStrings((cms.hosts?.hosts || []).map((host) => host.name))

  const sameAs = uniqueStrings([
    ...(cms.contact?.socialLinks || []).map((link) => (isLikelySocialProfileUrl(link.href) ? link.href : "")),
    ...(cms.footer?.socialLinks || []).map((link) => (isLikelySocialProfileUrl(link.href) ? link.href : "")),
  ])

  const email = pickFirstNonEmpty([cms.contact?.email, cms.footer?.email])

  return {
    cms,
    featuredVideos,
    description,
    primaryImageUrl,
    logoUrl,
    hostNames,
    sameAs,
    email,
    title: "Podcast Hosts, Episodes & Real Conversations",
  }
}

function toIsoDate(input: string): string | undefined {
  const timestamp = Date.parse(input)
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString()
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = getHomeSeoPayload()
  const keywordSet = uniqueStrings([
    ...DEFAULT_KEYWORDS,
    ...seo.hostNames,
    ...seo.featuredVideos.slice(0, 8).map((video) => video.title),
  ])

  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: "/",
    },
    authors: seo.hostNames.map((name) => ({ name })),
    creator: seo.hostNames.join(", ") || SITE_NAME,
    publisher: SITE_NAME,
    keywords: keywordSet,
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      images: [
        {
          url: seo.primaryImageUrl,
          alt: `${SITE_NAME} podcast`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.description,
      images: [seo.primaryImageUrl],
    },
  }
}

function buildHomeJsonLd(seo: HomeSeoPayload): Record<string, unknown> {
  const organizationId = `${SITE_URL}#organization`
  const websiteId = `${SITE_URL}#website`
  const webpageId = `${SITE_URL}#webpage`
  const podcastId = `${SITE_URL}#podcast`

  const hostProfiles = (seo.cms.hosts?.hosts || [])
    .map((host, index) => {
      const name = host.name?.trim()

      if (!name) {
        return null
      }

      return {
        id: `${SITE_URL}#host-${index + 1}`,
        name,
        bio: host.bio?.trim() || undefined,
        image: toAbsoluteUrl(host.image),
      }
    })
    .filter((host): host is NonNullable<typeof host> => Boolean(host))

  const producerName = seo.cms.producer?.name?.trim()
  const producerNode = producerName
    ? {
        "@type": "Person",
        "@id": `${SITE_URL}#producer`,
        name: producerName,
        description: seo.cms.producer?.bio?.trim() || undefined,
        image: toAbsoluteUrl(seo.cms.producer?.image),
      }
    : null

  const videoNodes = seo.featuredVideos.map((video, index) => {
    const videoId = `${SITE_URL}#video-${video.id}`
    const episodeId = `${SITE_URL}#episode-${video.id}`
    const contentUrl = toAbsoluteUrl(video.src)
    const uploadDate = toIsoDate(video.uploadDate)
    const description = truncateForMeta(video.description || video.title, 220)

    return {
      listItem: {
        "@type": "ListItem",
        position: index + 1,
        item: { "@id": episodeId },
      },
      episode: {
        "@type": "PodcastEpisode",
        "@id": episodeId,
        name: video.title,
        description,
        url: `${SITE_URL}#videos`,
        datePublished: uploadDate,
        partOfSeries: { "@id": podcastId },
        associatedMedia: { "@id": videoId },
      },
      video: {
        "@type": "VideoObject",
        "@id": videoId,
        name: video.title,
        description,
        uploadDate,
        contentUrl,
        thumbnailUrl: seo.primaryImageUrl,
        isFamilyFriendly: true,
        inLanguage: "en",
      },
      episodeRef: { "@id": episodeId },
    }
  })

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: seo.logoUrl,
        },
        email: seo.email || undefined,
        sameAs: seo.sameAs.length ? seo.sameAs : undefined,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_URL,
        name: SITE_NAME,
        description: seo.description,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: SITE_URL,
        name: `${seo.title} | ${SITE_NAME}`,
        description: seo.description,
        isPartOf: { "@id": websiteId },
        about: { "@id": podcastId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: seo.primaryImageUrl,
        },
        mainEntity: { "@id": podcastId },
      },
      {
        "@type": "PodcastSeries",
        "@id": podcastId,
        name: SITE_NAME,
        alternateName: "R3T",
        url: SITE_URL,
        description: seo.description,
        image: seo.primaryImageUrl,
        inLanguage: "en",
        publisher: { "@id": organizationId },
        creator: hostProfiles.map((host) => ({ "@id": host.id })),
        producer: producerNode ? { "@id": `${SITE_URL}#producer` } : undefined,
        hasPart: videoNodes.map((node) => node.episodeRef),
      },
      ...hostProfiles.map((host) => ({
        "@type": "Person",
        "@id": host.id,
        name: host.name,
        description: host.bio,
        image: host.image,
      })),
      ...(producerNode ? [producerNode] : []),
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}#featured-episodes`,
        name: "Featured Podcast Episodes",
        itemListElement: videoNodes.map((node) => node.listItem),
      },
      ...videoNodes.flatMap((node) => [node.episode, node.video]),
    ],
  }
}

export default async function Home() {
  const seo = getHomeSeoPayload()
  const jsonLd = buildHomeJsonLd(seo)

  return (
    <main className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <About />
      <Hosts />
      <Producer />
      <Videos />
      <Partners />
      <Contact />
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SeoPageLinks title="Browse R3T Pages" />
        </div>
      </section>
      <Footer />
    </main>
  )
}
