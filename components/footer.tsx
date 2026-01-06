"use client"

import { motion } from "framer-motion"
import { ArrowUp, Instagram, Youtube, Linkedin, Mail } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

// Icon mapping
const iconMap: { [key: string]: any } = {
  Instagram,
  Youtube,
  Linkedin,
}

export default function Footer() {
  const [footerData, setFooterData] = useState({
    logo: "/r3t-logo.png",
    description: "Navigating work, life, and everything in between with humor, honesty, and music.",
    email: "routesroutesrealtalk@gmail.com",
    location: "London, UK",
    quickLinks: [
      { name: "Home", href: "#" },
      { name: "About", href: "#about" },
      { name: "Episodes", href: "#partners" },
      { name: "Videos", href: "#videos" },
      { name: "Contact", href: "#contact" },
    ],
    socialLinks: [
      { name: "Instagram", icon: "Instagram", href: "#" },
      { name: "TikTok", icon: "", href: "#", logo: "" },
      { name: "YouTube", icon: "Youtube", href: "#" },
      { name: "LinkedIn", icon: "Linkedin", href: "#" },
    ]
  })

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/cms')
        const data = await response.json()
        if (data.footer) {
          setFooterData(data.footer)
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error)
      }
    }
    fetchFooterData()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
//test
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-black" />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main footer content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-12 sm:py-16 md:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 lg:gap-16"
        >
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Image src={footerData.logo || "/r3t-logo.png"} alt="R3T Podcast Logo" width={120} height={120} className="h-16 sm:h-20 w-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base font-medium text-foreground/90 mb-3 sm:mb-4 leading-relaxed">Roots, Routes & Real Talk</p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {footerData.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2 sm:gap-3">
              {footerData.quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all duration-300 w-fit hover:translate-x-1 relative group"
                >
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-foreground">Get in Touch</h4>
            <div className="flex flex-col gap-3 sm:gap-4">
              <a
                href={`mailto:${footerData.email}`}
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {footerData.email}
              </a>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {footerData.location}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 text-foreground">Follow Us</h4>
            <div className="flex gap-2 sm:gap-3">
              {footerData.socialLinks.map((social) => {
                const Icon = iconMap[social.icon] || Instagram
                const hasLogo = social.logo && social.logo.trim() !== ''
                return (
                  <motion.a
                    key={social.name}
                    href={social.href || "#"}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group shadow-lg hover:shadow-primary/20"
                    aria-label={social.name}
                  >
                    {hasLogo ? (
                      <img
                        src={social.logo}
                        alt={social.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                    )}
                  </motion.a>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="py-6 sm:py-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4"
        >
          <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} R3T Podcast. All rights reserved.
          </p>

          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary hover:border-primary transition-all duration-300 text-xs sm:text-sm font-medium"
          >
            <span className="text-primary group-hover:text-primary-foreground transition-colors">Back to Top</span>
            <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary group-hover:text-primary-foreground group-hover:-translate-y-1 transition-all duration-300" />
          </motion.button>
        </motion.div>
      </div>
    </footer>
  )
}
