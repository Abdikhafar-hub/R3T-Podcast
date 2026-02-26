import type { Metadata } from "next"
import { SeoPageShell } from "@/components/seo/page-shell"
import { getCmsData, getFeaturedVideos } from "@/lib/content"
import {
  buildPageMetadata,
  isHttpUrl,
  safeJsonLd,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
  truncateForMeta,
  uniqueStrings,
} from "@/lib/seo"

export const revalidate = 3600

function formatDate(dateValue: string): string {
  const timestamp = Date.parse(dateValue)
  if (Number.isNaN(timestamp)) {
    return dateValue
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp))
}

function toIso(dateValue: string): string | undefined {
  const timestamp = Date.parse(dateValue)
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString()
}

function getEpisodesPayload() {
  const cms = getCmsData()
  const videos = getFeaturedVideos(50)
  const platforms = (cms.partners?.platforms || []).filter((platform) => platform?.name?.trim())
  const latestVideo = videos[0]
  const description = truncateForMeta(
    latestVideo?.description ||
      cms.partners?.subtitle ||
      "Browse featured R3T podcast episodes and watch videos or listen on supported platforms.",
    170,
  )

  const image = cms.hero?.slides?.[0]?.image || cms.about?.image || cms.footer?.logo || "/r3t-logo.png"

  return { videos, platforms, description, image }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = getEpisodesPayload()

  return buildPageMetadata({
    title: "Episodes",
    description: data.description,
    path: "/episodes",
    image: data.image,
    keywords: uniqueStrings(["r3t episodes", "podcast episodes", ...data.videos.slice(0, 10).map((video) => video.title)]),
  })
}

export default function EpisodesPage() {
  const data = getEpisodesPayload()

  const listItems = data.videos.map((video, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "PodcastEpisode",
      "@id": `${SITE_URL}/episodes#episode-${video.id}`,
      name: video.title,
      description: truncateForMeta(video.description || video.title, 220),
      datePublished: toIso(video.uploadDate),
      url: `${SITE_URL}/episodes`,
      associatedMedia: {
        "@type": "VideoObject",
        contentUrl: toAbsoluteUrl(video.src),
        name: video.title,
        uploadDate: toIso(video.uploadDate),
      },
    },
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/episodes#webpage`,
        url: `${SITE_URL}/episodes`,
        name: "R3T Episodes",
        description: data.description,
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/episodes#itemlist`,
        name: "R3T Featured Episodes",
        itemListElement: listItems,
      },
      {
        "@type": "PodcastSeries",
        "@id": `${SITE_URL}#podcast`,
        name: SITE_NAME,
        url: SITE_URL,
      },
    ],
  }

  return (
    <SeoPageShell currentPath="/episodes" title="Episodes" description={data.description}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <section className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Featured Video Episodes</h2>
          <p className="mt-3 text-muted-foreground">
            Browse current featured videos from R3T. Add episode-specific pages later for even stronger SEO on each episode.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {data.videos.length > 0 ? (
            data.videos.map((video) => {
              const absoluteVideoUrl = toAbsoluteUrl(video.src)
              const description = video.description?.trim()

              return (
                <article key={video.id} className="rounded-2xl border border-border bg-card/50 overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <video
                      src={video.src}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      playsInline
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                      <span>{formatDate(video.uploadDate)}</span>
                      <span aria-hidden="true">•</span>
                      <span>{video.featured ? "Featured" : "Episode"}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-xl font-semibold">{video.title}</h3>
                    {description ? <p className="mt-2 text-sm sm:text-base text-muted-foreground">{description}</p> : null}
                    {absoluteVideoUrl ? (
                      <a
                        href={absoluteVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex mt-4 text-sm font-medium text-primary hover:underline"
                      >
                        Open video source
                      </a>
                    ) : null}
                  </div>
                </article>
              )
            })
          ) : (
            <div className="rounded-2xl border border-border bg-card/50 p-6 text-muted-foreground">
              No featured episodes are available yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Listen Everywhere</h2>
        <p className="mt-3 text-muted-foreground">
          Find R3T on podcast and music platforms. Keep these links updated in the CMS to strengthen brand signals and discovery.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.platforms.length > 0 ? (
            data.platforms.map((platform, index) => {
              const href = platform.url?.trim() || ""
              const isLive = isHttpUrl(href)

              return isLive ? (
                <a
                  key={`${platform.name}-${index}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-border bg-background/50 p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="font-medium">{platform.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">Open platform</p>
                </a>
              ) : (
                <div key={`${platform.name}-${index}`} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="font-medium">{platform.name}</div>
                  <p className="mt-1 text-sm text-muted-foreground">Link coming soon</p>
                </div>
              )
            })
          ) : (
            <p className="text-muted-foreground">No listening platform links are published yet.</p>
          )}
        </div>
      </section>
    </SeoPageShell>
  )
}
