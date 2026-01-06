"use client"

import { motion } from "framer-motion"
import { Music, Radio, Podcast, Headphones, Mic2, Speaker } from "lucide-react"
import { useState, useEffect } from "react"

// Icon mapping
const iconMap: { [key: string]: any } = {
  Music,
  Radio,
  Podcast,
  Headphones,
  Mic2,
  Speaker,
}

// Partner Card Component
function PartnerCard({ platform, index, iconMap }: { platform: any, index: number, iconMap: any }) {
  const [logoError, setLogoError] = useState(false)
  const Icon = iconMap[platform.icon] || Music
  const hasLogo = platform.logo && platform.logo.trim() !== '' && !logoError

  return (
    <motion.a
      href={platform.url || "#"}
      target={platform.url && platform.url !== '#' ? '_blank' : undefined}
      rel={platform.url && platform.url !== '#' ? 'noopener noreferrer' : undefined}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.05 }}
      className="group"
    >
      <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col items-center justify-center gap-4 hover:border-primary transition-all duration-300">
        {hasLogo ? (
          // Display logo image
          <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden bg-background">
            <img
              src={platform.logo}
              alt={platform.name}
              className="w-full h-full object-contain p-2"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          // Display icon
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: `${platform.color || '#000000'}15`,
            }}
          >
            <Icon className="w-8 h-8 transition-all duration-300" style={{ color: platform.color || '#000000' }} />
          </div>
        )}
        <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
          {platform.name}
        </p>
      </div>
    </motion.a>
  )
}

export default function Partners() {
  const [partnersData, setPartnersData] = useState({
    title: "Listen Everywhere",
    subtitle: "Stream R3T on your favorite podcast platform",
    platforms: [
      { name: "Spotify", icon: "Music", color: "#1DB954", url: "#" },
      { name: "Apple Podcasts", icon: "Podcast", color: "#9333EA", url: "#" },
      { name: "Google Podcasts", icon: "Radio", color: "#4285F4", url: "#" },
      { name: "Amazon Music", icon: "Headphones", color: "#FF9900", url: "#" },
      { name: "YouTube Music", icon: "Speaker", color: "#FF0000", url: "#" },
      { name: "Podcast Addict", icon: "Mic2", color: "#F59E0B", url: "#" },
    ]
  })

  useEffect(() => {
    const fetchPartnersData = async () => {
      try {
        const response = await fetch('/api/cms')
        const data = await response.json()
        if (data.partners) {
          setPartnersData(data.partners)
        }
      } catch (error) {
        console.error('Failed to fetch partners data:', error)
      }
    }
    fetchPartnersData()
  }, [])
  return (
    <section id="partners" className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">
            {(() => {
              const words = partnersData.title.split(' ')
              if (words.length >= 2) {
                return (
                  <>
                    {words.slice(0, -1).join(' ')} <span className="text-primary">{words.slice(-1)[0]}</span>
                  </>
                )
              } else {
                return <span className="text-primary">{partnersData.title}</span>
              }
            })()}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {partnersData.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {partnersData.platforms && Array.isArray(partnersData.platforms) && partnersData.platforms.map((platform, index) => {
            return (
              <PartnerCard
                key={platform.name || index}
                platform={platform}
                index={index}
                iconMap={iconMap}
              />
            )
          })}
        </div>

        {/* Optional sponsor section */}
        
      </div>
    </section>
  )
}
