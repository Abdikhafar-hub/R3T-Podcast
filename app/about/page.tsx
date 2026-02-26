import type { Metadata } from "next"
import { SeoPageShell } from "@/components/seo/page-shell"
import { getCmsData } from "@/lib/content"
import { buildPageMetadata, safeJsonLd, SITE_NAME, SITE_URL, toAbsoluteUrl, truncateForMeta } from "@/lib/seo"

export const revalidate = 3600

function getAboutPayload() {
  const cms = getCmsData()
  const title = cms.about?.title?.trim() || "About R3T"
  const paragraphs = (cms.about?.content || []).filter((paragraph): paragraph is string => Boolean(paragraph?.trim()))
  const description = truncateForMeta(
    paragraphs[0] || cms.hero?.slides?.[0]?.subtitle || "Learn about the R3T podcast, its mission, and the conversations it hosts.",
    170,
  )
  const image = cms.about?.image || cms.hero?.slides?.[0]?.image || "/r3t-logo.png"
  const imageAlt = cms.about?.imageAlt || `${SITE_NAME} podcast`

  return { title, paragraphs, description, image, imageAlt }
}

export async function generateMetadata(): Promise<Metadata> {
  const about = getAboutPayload()

  return buildPageMetadata({
    title: "About",
    description: about.description,
    path: "/about",
    image: about.image,
    keywords: ["about r3t", "podcast mission", "roots routes real talk about"],
  })
}

export default function AboutPage() {
  const about = getAboutPayload()

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#webpage`,
        url: `${SITE_URL}/about`,
        name: "About R3T Podcast",
        description: about.description,
        primaryImageOfPage: toAbsoluteUrl(about.image)
          ? {
              "@type": "ImageObject",
              url: toAbsoluteUrl(about.image),
            }
          : undefined,
      },
      {
        "@type": "PodcastSeries",
        "@id": `${SITE_URL}#podcast`,
        name: SITE_NAME,
        url: SITE_URL,
        description: about.description,
        image: toAbsoluteUrl(about.image),
      },
    ],
  }

  return (
    <SeoPageShell currentPath="/about" title="About R3T" description={about.description}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
        <article className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-5">{about.title}</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            {about.paragraphs.length > 0 ? (
              about.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>R3T shares real conversations about work, life, growth, and the routes people take through change.</p>
            )}
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
            <img
              src={about.image}
              alt={about.imageAlt}
              className="w-full h-72 object-cover"
              loading="lazy"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h3 className="font-semibold text-lg mb-3">What to Explore Next</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/hosts" className="text-primary hover:underline">
                  Meet the hosts and producer
                </a>
              </li>
              <li>
                <a href="/episodes" className="text-primary hover:underline">
                  Browse featured episodes and videos
                </a>
              </li>
              <li>
                <a href="/contact" className="text-primary hover:underline">
                  Contact R3T and social channels
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </SeoPageShell>
  )
}
