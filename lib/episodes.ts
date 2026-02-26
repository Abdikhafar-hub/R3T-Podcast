import { getVideos, type Video } from "@/lib/content"

export type Episode = Video

export function getEpisodes(): Episode[] {
  return getVideos()
}

