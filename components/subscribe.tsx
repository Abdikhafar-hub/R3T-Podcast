"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Music2, Instagram, Twitter, Youtube } from "lucide-react"

export default function Subscribe() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  const platforms = [
    { name: "Spotify", icon: Music2, link: "#" },
    { name: "Instagram", icon: Instagram, link: "#" },
    { name: "Twitter", icon: Twitter, link: "#" },
    { name: "YouTube", icon: Youtube, link: "#" },
  ]

  return (
    <section id="subscribe" className="py-20 sm:py-32 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Image_fx (15.png')`,
        }}
      />
      <div className="absolute inset-0 bg-background/80" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance">
            Join the <span className="text-primary">Conversation</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 text-balance">
            Subscribe to our newsletter for episode updates, behind-the-scenes content, and exclusive stories.
          </p>

          <form onSubmit={handleSubmit} className="mb-12">
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-3 bg-background border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </form>

          <div className="space-y-6">
            <p className="text-sm text-muted-foreground font-medium">Follow us on</p>
            <div className="flex items-center justify-center gap-6">
              {platforms.map((platform) => (
                <motion.a
                  key={platform.name}
                  href={platform.link}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={platform.name}
                >
                  <platform.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
