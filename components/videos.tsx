"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Play } from "lucide-react"

export default function Videos() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)

  const videos = [
    {
      title: "Behind the Mic: Episode Highlights",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Video%202025-10-13%20at%207.56.26%20PM-Rp1pcyHKdGbNdgZ4ROkfyBH9pzGBiF.mp4",
    },
    {
      title: "The Story Behind R3T",
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Video%202025-10-13%20at%207.56.26%20PM%20%282%29-pbW912r7Xc421ZDsmGNO3dtYDFMt74.mp4",
    },
    {
      title: "R3T Podcast Session",
      src: "/WhatsApp Video 2025-10-13 at 7.56.26 PM (1).mp4",
    },
  ]

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

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {videos.map((video, index) => (
            <motion.div
              key={video.title}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
