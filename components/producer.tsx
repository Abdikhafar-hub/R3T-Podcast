"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function Producer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-16 text-center text-balance"
        >
          Meet the <span className="text-secondary">Producer</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="relative overflow-hidden rounded-lg aspect-square">
                <img
                  src="/producer.jpg"
                  alt="Nil Oztas"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4 text-primary">Nil Oztas</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nil is an outgoing explorer who thrives on new opportunities and stepping outside of her comfort zone.
                On a journey of self discovery, she embraces the challenge of trying new things and seeing where
                curiosity leads! With her open spirit, courage and growing vision for leadership, Nil brings energy,
                authenticity and fresh perspective to R3T.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
