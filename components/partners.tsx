"use client"

import { motion } from "framer-motion"
import { Music, Radio, Podcast, Headphones, Mic2, Speaker } from "lucide-react"

const partners = [
  { name: "Spotify", icon: Music, color: "#1DB954" },
  { name: "Apple Podcasts", icon: Podcast, color: "#9333EA" },
  { name: "Google Podcasts", icon: Radio, color: "#4285F4" },
  { name: "Amazon Music", icon: Headphones, color: "#FF9900" },
  { name: "YouTube Music", icon: Speaker, color: "#FF0000" },
  { name: "Podcast Addict", icon: Mic2, color: "#F59E0B" },
]

export default function Partners() {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">
            Listen <span className="text-primary">Everywhere</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stream R3T on your favorite podcast platform
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {partners.map((partner, index) => {
            const Icon = partner.icon
            return (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group"
              >
                <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col items-center justify-center gap-4 hover:border-primary transition-all duration-300">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: `${partner.color}15`,
                    }}
                  >
                    <Icon className="w-8 h-8 transition-all duration-300" style={{ color: partner.color }} />
                  </div>
                  <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                    {partner.name}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Optional sponsor section */}
        
      </div>
    </section>
  )
}
