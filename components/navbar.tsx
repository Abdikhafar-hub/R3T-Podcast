"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navbarData, setNavbarData] = useState({
    logo: "/r3t-logo.png",
    navLinks: [
      { href: "#about", label: "About" },
      { href: "#hosts", label: "Hosts" },
      { href: "#videos", label: "Videos" },
      { href: "#partners", label: "Episodes" },
    ],
    ctaText: "Listen Now",
    ctaLink: "#videos"
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const response = await fetch('/api/cms')
        const data = await response.json()
        if (data.navbar) {
          setNavbarData(data.navbar)
        }
      } catch (error) {
        console.error('Failed to fetch navbar data:', error)
      }
    }
    fetchNavbarData()
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center">
            <Image src={navbarData.logo || "/r3t-logo.png"} alt="R3T Podcast Logo" width={100} height={100} className="h-16 w-auto sm:h-18 md:h-20" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navbarData.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            <Link
              href={navbarData.ctaLink || "#videos"}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105"
            >
              {navbarData.ctaText || "Listen Now"}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card border-t border-border"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navbarData.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            
            <Link
              href={navbarData.ctaLink || "#videos"}
              onClick={() => setMobileMenuOpen(false)}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all text-center"
            >
              {navbarData.ctaText || "Listen Now"}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
