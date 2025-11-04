"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

export default function Hosts() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [hostsData, setHostsData] = useState({
    title: "Meet the Hosts",
    hosts: [
      {
        id: "host-1",
        name: "Serufusa Sekidde",
        image: "/podcast .jpeg",
        bio: "Serufusa is a connector, musician, and creative thinker who has always believed that sound and story are inseparable. He's worked across global health, leadership, and partnerships, but what excites him most is the music and humour that carry us through life's detours. On R3T, he brings rhythm, honesty, and the courage to dive into both the wins and the woes.",
      },
      {
        id: "host-2",
        name: "Hewan Wole",
        image: "/hewan-headshot.jpg",
        bio: "Hewan is a storyteller at heart with a background in leadership, strategy, and making sense of the human side of work. She's passionate about the conversations that often go unspoken in professional spaces — how we show up, what grounds us, and the messy but meaningful routes we take to grow. With a curious mind and a warm laugh, she brings a thoughtful, reflective energy to R3T.",
      },
    ]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHostsData = async () => {
      try {
        const response = await fetch('/api/cms')
        const data = await response.json()
        if (data.hosts) {
          setHostsData(data.hosts)
        }
      } catch (error) {
        console.error('Failed to fetch hosts data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHostsData()
  }, [])

  return (
    <section id="hosts" className="py-20 sm:py-32 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-16 text-center text-balance"
        >
          {(() => {
            const words = hostsData.title.split(' ')
            if (words.length >= 2) {
              return (
                <>
                  {words.slice(0, -2).join(' ')} <span className="text-primary">{words.slice(-2).join(' ')}</span>
                </>
              )
            } else {
              return <span className="text-primary">{hostsData.title}</span>
            }
          })()}
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {hostsData.hosts.map((host, index) => (
            <motion.div
              key={host.id || host.name}
              initial={{ opacity: 0, y: 80 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.3 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg mb-6 aspect-square">
                <img
                  src={host.image || "/placeholder.svg"}
                  alt={host.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4 text-secondary">{host.name}</h3>
              <p className="text-muted-foreground leading-relaxed">{host.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
