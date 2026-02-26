import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"
import { getEpisodes } from "@/lib/episodes"

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const episodes = getEpisodes()
  const latestEpisodeDate = episodes
    .map((episode) => Date.parse(episode.uploadDate))
    .filter((timestamp) => !Number.isNaN(timestamp))
    .sort((a, b) => b - a)[0]

  const latestContentDate = latestEpisodeDate ? new Date(latestEpisodeDate) : new Date()

  return [
    {
      url: SITE_URL,
      lastModified: latestContentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: latestContentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/hosts`,
      lastModified: latestContentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/episodes`,
      lastModified: latestContentDate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: latestContentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}
