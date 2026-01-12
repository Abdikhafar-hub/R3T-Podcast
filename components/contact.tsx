"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Mail, Instagram, Youtube, Linkedin } from "lucide-react"

// Icon mapping
const iconMap: { [key: string]: any } = {
  Instagram,
  Youtube,
  Linkedin,
}

// Social Link Card Component
function SocialLinkCard({ social, iconMap }: { social: any, iconMap: any }) {
  const [logoError, setLogoError] = useState(false)
  const Icon = iconMap[social.icon] || Instagram
  const hasLogo = social.logo && social.logo.trim() !== '' && !logoError

  return (
    <motion.a
      href={social.href || "#"}
      target={social.href && social.href !== '#' ? '_blank' : undefined}
      rel={social.href && social.href !== '#' ? 'noopener noreferrer' : undefined}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-background border border-border hover:border-primary transition-colors group"
    >
      {hasLogo ? (
        // Display logo image
        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-background flex-shrink-0">
          <img
            src={social.logo}
            alt={social.name}
            className="w-full h-full object-contain p-2"
            onError={() => setLogoError(true)}
          />
        </div>
      ) : (
        // Display icon
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${social.color || '#000000'}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: social.color || '#000000' }} />
        </div>
      )}
      <span className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">
        {social.name}
      </span>
    </motion.a>
  )
}

export default function Contact() {
  const [contactData, setContactData] = useState({
    title: "Let's Connect",
    subtitle: "Have a story to share? Want to collaborate? We'd love to hear from you.",
    email: "routesroutesrealtalk@gmail.com",
    socialLinks: [
      { name: "Instagram", icon: "Instagram", href: "#", color: "#E4405F" },
      { name: "TikTok", icon: "", href: "#", color: "#000000", logo: "" },
      { name: "YouTube", icon: "Youtube", href: "#", color: "#FF0000" },
      { name: "LinkedIn", icon: "Linkedin", href: "#", color: "#0A66C2" },
    ]
  })

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await fetch('/api/cms')
        const data = await response.json()
        if (data.contact) {
          setContactData(data.contact)
        }
      } catch (error) {
        console.error('Failed to fetch contact data:', error)
      }
    }
    fetchContactData()
  }, [])

  return (
    <section id="contact" className="py-12 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-4">
            {(() => {
              const words = contactData.title.split(' ')
              if (words.length >= 2) {
                return (
                  <>
                    {words.slice(0, -1).join(' ')} <span className="text-primary">{words.slice(-1)[0]}</span>
                  </>
                )
              } else {
                return <span className="text-primary">{contactData.title}</span>
              }
            })()}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            {contactData.subtitle}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Email */}
            <div className="bg-card/50 border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                  <a
                    href={`mailto:${contactData.email}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {contactData.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-card/50 border border-border rounded-2xl p-6 sm:p-8">
              <h3 className="font-semibold text-lg mb-4 sm:mb-6">Follow Us</h3>
              {(contactData.socialLinks || []).length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {contactData.socialLinks && Array.isArray(contactData.socialLinks) && contactData.socialLinks.map((social) => {
                    return (
                      <SocialLinkCard
                        key={social.name}
                        social={social}
                        iconMap={iconMap}
                      />
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No social links added yet.
                </p>
              )}
            </div>

           
          </motion.div>
        </div>
      </div>
    </section>
  )
}
