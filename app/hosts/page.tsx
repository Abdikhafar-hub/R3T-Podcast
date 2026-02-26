import type { Metadata } from "next"
import { SeoPageShell } from "@/components/seo/page-shell"
import { getCmsData } from "@/lib/content"
import { buildPageMetadata, safeJsonLd, SITE_NAME, SITE_URL, toAbsoluteUrl, truncateForMeta, uniqueStrings } from "@/lib/seo"

export const revalidate = 3600

function getHostsPayload() {
  const cms = getCmsData()
  const hosts = (cms.hosts?.hosts || []).filter((host) => host?.name?.trim())
  const producer = cms.producer?.name?.trim() ? cms.producer : null
  const hostNames = uniqueStrings(hosts.map((host) => host.name))

  const description = truncateForMeta(
    hostNames.length
      ? `Meet the R3T podcast hosts ${hostNames.join(" and ")}${producer?.name ? ` plus producer ${producer.name}` : ""}.`
      : "Meet the hosts behind Roots, Routes & Real Talk (R3T).",
    170,
  )

  const image = hosts[0]?.image || producer?.image || cms.footer?.logo || "/r3t-logo.png"

  return { hosts, producer, hostNames, description, image }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = getHostsPayload()

  return buildPageMetadata({
    title: "Hosts",
    description: data.description,
    path: "/hosts",
    image: data.image,
    keywords: ["r3t hosts", "podcast hosts", ...data.hostNames],
  })
}

export default function HostsPage() {
  const data = getHostsPayload()

  const personNodes = data.hosts.map((host, index) => ({
    "@type": "Person",
    "@id": `${SITE_URL}/hosts#host-${index + 1}`,
    name: host.name,
    description: host.bio || undefined,
    image: toAbsoluteUrl(host.image),
    worksFor: { "@id": `${SITE_URL}#organization` },
  }))

  const producerNode = data.producer
    ? {
        "@type": "Person",
        "@id": `${SITE_URL}/hosts#producer`,
        name: data.producer.name,
        description: data.producer.bio || undefined,
        image: toAbsoluteUrl(data.producer.image),
        jobTitle: "Podcast Producer",
        worksFor: { "@id": `${SITE_URL}#organization` },
      }
    : null

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/hosts#webpage`,
        url: `${SITE_URL}/hosts`,
        name: "R3T Hosts",
        description: data.description,
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      ...personNodes,
      ...(producerNode ? [producerNode] : []),
    ],
  }

  return (
    <SeoPageShell currentPath="/hosts" title="Hosts" description={data.description}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      <section className="space-y-6">
        <div className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Meet the Hosts</h2>
          <p className="mt-3 text-muted-foreground">
            The R3T hosts bring experience in storytelling, leadership, creativity, and honest conversation.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {data.hosts.length > 0 ? (
            data.hosts.map((host, index) => (
              <article key={host.id || host.name || index} className="rounded-2xl border border-border bg-card/50 overflow-hidden">
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={host.image || "/placeholder-user.jpg"}
                    alt={host.name || "R3T host"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold">{host.name}</h3>
                  {host.bio ? <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">{host.bio}</p> : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-card/50 p-6 text-muted-foreground">
              Host profiles will appear here once published in the CMS.
            </div>
          )}
        </div>
      </section>

      {data.producer ? (
        <section className="rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-5">Producer</h2>
          <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
            <div className="rounded-xl overflow-hidden border border-border bg-muted">
              <img
                src={data.producer.image || "/placeholder-user.jpg"}
                alt={data.producer.name || "R3T producer"}
                className="w-full h-full object-cover aspect-square"
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold">{data.producer.name}</h3>
              {data.producer.bio ? <p className="mt-3 text-muted-foreground leading-relaxed">{data.producer.bio}</p> : null}
            </div>
          </div>
        </section>
      ) : null}
    </SeoPageShell>
  )
}
