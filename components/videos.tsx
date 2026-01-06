"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Play } from "lucide-react"

interface Video {
  id: string
  title: string
  description?: string
  src: string
  uploadDate: string
  featured: boolean
}

export default function Videos() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos')
        const data = await response.json()
        setVideos(data.filter((video: Video) => video.featured))
      } catch (error) {
        console.error('Failed to fetch videos:', error)
        // Fallback to empty array if API fails
        setVideos([])
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleVideoClick = (index: number, videoElement: HTMLVideoElement) => {
    if (playingVideo === index) {
      videoElement.pause()
      setPlayingVideo(null)
    } else {
      const allVideos = document.querySelectorAll("video")
      allVideos.forEach((v) => v.pause())

      videoElement.play()
      setPlayingVideo(index)
    }
  }

  return (
    <section id="videos" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-16 text-center text-balance"
        >
          Featured <span className="text-secondary">Videos</span>
        </motion.h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No featured videos available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {videos && Array.isArray(videos) && videos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 80 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-video bg-muted">
                  <video
                    src={video.src}
                    className="w-full h-full object-cover"
                    onClick={(e) => handleVideoClick(index, e.currentTarget)}
                    onEnded={() => setPlayingVideo(null)}
                    playsInline
                  />
                  <div
                    className={`absolute inset-0 bg-background/60 transition-opacity duration-300 flex items-center justify-center cursor-pointer ${
                      playingVideo === index ? "opacity-0 pointer-events-none" : "opacity-100"
                    }`}
                    onClick={(e) => {
                      const videoElement = e.currentTarget.previousElementSibling as HTMLVideoElement
                      handleVideoClick(index, videoElement)
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="text-primary-foreground ml-1" size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <h3 className="font-serif text-lg font-bold group-hover:text-primary transition-colors">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {video.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
