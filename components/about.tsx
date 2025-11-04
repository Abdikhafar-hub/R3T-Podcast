"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [aboutData, setAboutData] = useState({
    title: "About R3T",
    content: [
      "Roots, Routes & Real Talk (R3T) is a podcast about navigating work, life, and everything in between; with humour, honesty, and a dose of music. Hosted by Serufusa Sekidde and Hewan Wole, we sit down with people who've taken unexpected turns, faced real challenges, and found their own ways forward.",
      "Our conversations aren't polished monologues or corporate pep talks. They're story-driven, playful, and grounded in the things that actually shape us: the roots that anchor us, the routes that change us, and the real talk that connects us.",
      "Each episode mixes candid stories, a little laughter, and the music or rituals that keep our guests moving. If you're looking for conversations that make you think, nod along, and maybe even see your own journey differently, you'll feel at home here."
    ],
    image: "/podcast-microphone.jpeg",
    imageAlt: "Professional podcast microphone setup"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/cms')
        const data = await response.json()
        if (data.about) {
          setAboutData(data.about)
        }
      } catch (error) {
        console.error('Failed to fetch about data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAboutData()
  }, [])

  return (
    <section id="about" className="py-12 sm:py-20 md:py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/placeholder.svg?height=800&width=1920&query=abstract+soundwave+pattern)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 text-center text-balance">
            {(() => {
              const words = aboutData.title.split(' ')
              if (words.length >= 2) {
                return (
                  <>
                    {words.slice(0, -1).join(' ')} <span className="text-secondary">{words.slice(-1)[0]}</span>
                  </>
                )
              } else {
                return <span className="text-secondary">{aboutData.title}</span>
              }
            })()}
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground">
              {aboutData.content.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 + (index * 0.2) }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src={aboutData.image || "/podcast-microphone.jpeg"}
                alt={aboutData.imageAlt || "Professional podcast microphone setup"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
