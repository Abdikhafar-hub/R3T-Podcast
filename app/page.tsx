import Hero from "@/components/hero"
import About from "@/components/about"
import Hosts from "@/components/hosts"
import Producer from "@/components/producer"
import Videos from "@/components/videos"
import Testimonials from "@/components/testimonials"
import Partners from "@/components/partners"
import Subscribe from "@/components/subscribe"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Hosts />
      <Producer />
      <Videos />
      <Testimonials />
      <Partners />
      <Subscribe />
      <Contact />
      <Footer />
    </main>
  )
}
