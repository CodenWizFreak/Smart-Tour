"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileDown, BarChart3, CheckCircle } from "lucide-react"
import Image from "next/image"
import { TeamCarousel } from "@/components/team-carousel"
import { CursorTrail } from "@/components/cursor-trail"
import { FloatingOrbs } from "@/components/floating-orbs"
import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownloadPDF = () => {
    // Open in a new tab to handle the redirect
    window.open("/api/download-pdf", "_blank")
  }

  if (!mounted) return null

  return (
    <main className="relative min-h-screen overflow-hidden">
      <CursorTrail />
      <FloatingOrbs />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-secondary shadow-lg shadow-secondary/20">
              <Image src="/images/logo-compass.png" alt="Smart Tour Logo" fill className="object-cover" />
            </div>
            <div className="relative h-12 w-48">
              <Image src="/images/logo-text.png" alt="Smart Tour" fill className="object-contain" />
            </div>
          </div>
        </header>

        <section id="home" className="py-20 flex flex-col items-center justify-center min-h-[70vh]">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Your <span className="text-gradient">Perfect Destination</span>
            </h2>
            <p className="text-lg mb-12 text-muted-foreground max-w-2xl mx-auto">
              Let our AI-powered travel assistant help you find the ideal vacation spot based on your preferences,
              budget, and travel season.
            </p>
            <Button
              size="lg"
              className="text-lg px-10 py-7 bg-gradient from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl rounded-full"
              onClick={() => router.push("/chat")}
            >
              Get Started
            </Button>
          </motion.div>
        </section>

        <section id="about" className="py-20">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-16 text-center text-gradient"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              About Us
            </motion.h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <p className="text-lg mb-6 leading-relaxed">
                  Smart Tour is an innovative travel recommendation platform that uses advanced AI to suggest
                  personalized travel destinations based on your preferences, budget constraints, and seasonal
                  considerations.
                </p>
                <p className="text-lg mb-8 leading-relaxed">
                  Our mission is to make travel planning effortless and enjoyable, helping you discover hidden gems and
                  popular destinations that perfectly match your travel style.
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-secondary text-secondary hover:bg-secondary/10"
                    onClick={handleDownloadPDF}
                  >
                    <FileDown size={16} />
                    Deep Dive
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
                    onClick={() => {
                      router.push("/dashboard")
                    }}
                  >
                    <BarChart3 size={16} />
                    Analysis Dashboard
                  </Button>
                </div>
              </motion.div>
              <motion.div
                className="rounded-xl overflow-hidden shadow-2xl border border-white/10 card-hover-effect card-glow"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Image
                  src="/images/family-travel.png"
                  alt="Family enjoying a road trip"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="py-20 bg-muted/10 rounded-xl backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-16 text-center text-gradient"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Why Us?
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI-Powered Recommendations",
                  description:
                    "Our advanced AI analyzes your preferences to suggest destinations that perfectly match your travel style.",
                },
                {
                  title: "Budget-Conscious Planning",
                  description:
                    "We consider your budget constraints to ensure you get the most value from your travel experience.",
                },
                {
                  title: "Seasonal Insights",
                  description:
                    "Travel at the perfect time with our seasonal recommendations that optimize your experience.",
                },
                {
                  title: "Local Expertise",
                  description:
                    "Discover hidden gems and authentic experiences with insights from local travel experts.",
                },
                {
                  title: "Interactive Visualization",
                  description: "Explore your recommended destinations on our interactive map for better planning.",
                },
                {
                  title: "Personalized Itineraries",
                  description: "Get custom travel plans tailored to your interests, not generic tourist routes.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg card-hover-effect card-glow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle className="text-secondary mt-1 h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="py-20">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-16 text-center text-gradient"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Our Team
            <p className="text-sm text-muted-foreground mt-2 italic">
    Check out the 'creative' minds behind this chaos
  </p>
          </motion.h2>
          <TeamCarousel />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="text-3xl md:text-5xl font-bold mb-16 text-center text-gradient"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem
                  value="item-1"
                  className="border border-white/10 rounded-lg px-6 py-2 bg-card/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-lg font-medium">How does Smart Tour work?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Smart Tour uses advanced AI to analyze your travel preferences, budget constraints, and seasonal
                    considerations. Simply tell us what kind of place you want to visit, your budget, when you want to
                    travel, and where you're traveling from. Our AI will then generate personalized recommendations
                    tailored specifically to your needs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="border border-white/10 rounded-lg px-6 py-2 bg-card/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-lg font-medium">Is Smart Tour free to use?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, Smart Tour is completely free to use. We believe that everyone should have access to
                    personalized travel recommendations without any cost barriers. We may introduce premium features in
                    the future, but our core recommendation service will always remain free.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="border border-white/10 rounded-lg px-6 py-2 bg-card/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-lg font-medium">Can Smart Tour book my trips?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Currently, Smart Tour focuses on providing personalized travel recommendations rather than booking
                    services. However, we're working on partnerships with booking platforms to integrate this
                    functionality in the future. For now, we provide detailed information to help you make informed
                    booking decisions on your preferred platforms.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="border border-white/10 rounded-lg px-6 py-2 bg-card/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-lg font-medium">
                    How accurate are the budget estimates?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Our budget estimates are based on average costs for accommodation, food, transportation, and
                    activities in each destination. They're designed to give you a realistic expectation, but actual
                    costs may vary based on your specific choices, travel style, and current market conditions. We
                    regularly update our data to ensure the most accurate estimates possible.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-5"
                  className="border border-white/10 rounded-lg px-6 py-2 bg-card/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="text-lg font-medium">
                    Does Smart Tour work for international destinations?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Currently, Smart Tour specializes in Indian tourism destinations. We're focusing on providing deep,
                    high-quality recommendations for India first, but we plan to expand to international destinations in
                    the near future. Our roadmap includes adding new countries and regions progressively to ensure the
                    same level of detailed, personalized recommendations.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}
