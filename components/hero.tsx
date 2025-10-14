"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const slides = [
  {
    image: "/podcast-studio-hero.png",
    title: "Roots, Routes & Real Talk",
    subtitle: "Conversations that make you think, laugh, and find your rhythm.",
    cta: "Watch Now",
    ctaLink: "#videos",
  },
  {
    image: "/roots-waveform.png",
    title: "Where Stories Take Root",
    subtitle: "Exploring the origins, journeys, and authentic voices that shape our world.",
    cta: "Explore Videos",
    ctaLink: "#videos",
  },
  {
    image: "/woman-recording.png",
    title: "Real Conversations, Real People",
    subtitle: "Join us for honest discussions about work, life, and everything in between.",
    cta: "Meet the Hosts",
    ctaLink: "#hosts",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
      <motion.div
  key={currentSlide}
  className="absolute inset-0 z-0"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.7 }}
>
<div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${slides[currentSlide].image})`,
  }}
/>

  <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
</motion.div>

      </AnimatePresence>

      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm border border-primary/20 hover:bg-primary/20 hover:border-primary transition-all group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="text-foreground group-hover:text-primary transition-colors" size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm border border-primary/20 hover:bg-primary/20 hover:border-primary transition-all group"
        aria-label="Next slide"
      >
        <ChevronRight className="text-foreground group-hover:text-primary transition-colors" size={24} />
      </button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {slides[currentSlide].title.includes("&") ? (
                <>
                  {slides[currentSlide].title.split("&")[0]}
                  &<br />
                  <span className="text-primary">{slides[currentSlide].title.split("&")[1]}</span>
                </>
              ) : (
                <>
                  {slides[currentSlide].title.split(" ").slice(0, -2).join(" ")} <span className="text-primary">{slides[currentSlide].title.split(" ").slice(-2).join(" ")}</span>
                </>
              )}
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href={slides[currentSlide].ctaLink}
                className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                {slides[currentSlide].cta}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-primary w-8" : "bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <ChevronDown className="text-primary" size={32} />
        </motion.div>
      </div>
    </section>
  )
}
