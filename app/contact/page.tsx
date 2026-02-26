import type { Metadata } from "next"
import { SeoPageShell } from "@/components/seo/page-shell"
import { getCmsData } from "@/lib/content"
import {
  buildPageMetadata,
  isHttpUrl,
  isLikelySocialProfileUrl,
  safeJsonLd,
  SITE_NAME,
  SITE_URL,
  truncateForMeta,
  uniqueStrings,
} from "@/lib/seo"

export const revalidate = 3600

function getContactPayload() {
  const cms = getCmsData()
  const email = cms.contact?.email?.trim() || cms.footer?.email?.trim() || "routesroutesrealtalk@gmail.com"
  const subtitle = cms.contact?.subtitle?.trim() || "Contact the R3T team for collaborations, stories, and podcast inquiries."
  const socialLinks = [...(cms.contact?.socialLinks || []), ...(cms.footer?.socialLinks || [])].filter(
    (link) => link?.name?.trim(),
  )
  const liveSocialLinks = socialLinks.filter((link) => isHttpUrl(link.href))
  const sameAs = uniqueStrings(liveSocialLinks.map((link) => (isLikelySocialProfileUrl(link.href) ? link.href : "")))
  const description = truncateForMeta(`${subtitle} Email: ${email}`, 170)

  return { email, subtitle, socialLinks, liveSocialLinks, sameAs, description }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = getContactPayload()

  return buildPageMetadata({
    title: "Contact",
    description: data.description,
    path: "/contact",
    keywords: ["contact r3t", "podcast contact", "r3t social media"],
  })
}

export default function ContactPage() {
  const data = getContactPayload()

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact#webpage`,
        url: `${SITE_URL}/contact`,
        name: "Contact R3T",
        description: data.description,
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: data.email,
        sameAs: data.sameAs.length ? data.sameAs : undefined,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: data.email,
            availableLanguage: "en",
          },
        ],
      },
    ],
  }

  return (
    <SeoPageShell currentPath="/contact" title="Contact" description={data.subtitle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Get in Touch</h2>
          <p className="mt-3 text-muted-foreground">{data.subtitle}</p>

          <div className="mt-6 rounded-xl border border-border bg-background/50 p-4">
            <div className="text-sm text-muted-foreground">Email</div>
            <a href={`mailto:${data.email}`} className="mt-1 inline-block text-primary hover:underline break-all">
              {data.email}
            </a>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            For best SEO and trust signals, use real official profile URLs (Instagram, YouTube, LinkedIn, TikTok, etc.) in the CMS.
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Social Channels</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {data.socialLinks.length > 0 ? (
              data.socialLinks.map((link, index) => {
                const href = link.href?.trim() || ""
                const isLive = isHttpUrl(href)

                return isLive ? (
                  <a
                    key={`${link.name}-${index}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-border bg-background/50 p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="font-medium">{link.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">Open profile</p>
                  </a>
                ) : (
                  <div key={`${link.name}-${index}`} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="font-medium">{link.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">Link not set yet</p>
                  </div>
                )
              })
            ) : (
              <p className="text-muted-foreground">No social links published yet.</p>
            )}
          </div>
        </div>
      </section>
    </SeoPageShell>
  )
}

