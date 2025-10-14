"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    quote:
      "R3T is the podcast I didn't know I needed. Every episode feels like catching up with friends who actually get it.",
    name: "Nil Oztas",
    role: "Producer",
    avatar: "/producer.jpg",
  },
  
  {
    quote: "Finally, a podcast that tackles work-life balance without the corporate BS. Raw, honest, and refreshing.",
    name: "Jane Doe",
    role: "Entrepreneur",
    avatar: "/professional-woman-portrait.png",
  },
  
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % testimonials.length
      }
      return prev === 0 ? testimonials.length - 1 : prev - 1
    })
  }

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">
            Listener <span className="text-primary">Voices</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">What our community is saying about R3T</p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Testimonial carousel */}
          <div className="relative h-[400px] md:h-[300px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full"
              >
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12">
                  <div className="flex flex-col items-center text-center">
                    <motion.img
                      src={testimonials[current].avatar}
                      alt={testimonials[current].name}
                      className="w-16 h-16 rounded-full mb-6 object-cover"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    />
                    <p className="text-xl md:text-2xl font-light mb-6 leading-relaxed">
                      "{testimonials[current].quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-lg">{testimonials[current].name}</p>
                      <p className="text-muted-foreground">{testimonials[current].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => paginate(-1)}
              className="p-3 rounded-full bg-card/50 border border-border hover:bg-primary hover:border-primary transition-colors group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 group-hover:text-primary-foreground transition-colors" />
            </button>

            {/* Dots indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1)
                    setCurrent(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === current ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => paginate(1)}
              className="p-3 rounded-full bg-card/50 border border-border hover:bg-primary hover:border-primary transition-colors group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 group-hover:text-primary-foreground transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
