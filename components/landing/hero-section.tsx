"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen } from "lucide-react"
import { LoginModal } from "@/components/auth/loginModal"
import { useSession } from "next-auth/react"

export function HeroSection() {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Typewriter State
  const phrases = ["Your Medical Agent", "Detects Any Ailment", "Guides Like Doctors"]
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  // Typewriter Effect Logic
  useEffect(() => {
    const handleTyping = () => {
      const i = currentPhraseIndex % phrases.length
      const fullText = phrases[i]

      setDisplayText(
        isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1)
      )

      // Dynamic Speed
      setTypingSpeed(isDeleting ? 50 : 150)

      if (!isDeleting && displayText === fullText) {
        // Finished typing phrase, pause before deleting
        setTimeout(() => setIsDeleting(true), 2000)
      } else if (isDeleting && displayText === "") {
        // Finished deleting, move to next phrase
        setIsDeleting(false)
        setCurrentPhraseIndex(currentPhraseIndex + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [displayText, isDeleting, phrases, currentPhraseIndex, typingSpeed])

  const handleGetStarted = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault()
      setShowLoginModal(true)
    }
  }

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      
      {/* --- Ambient Color Patches --- */}
      {/* Top Left Gradient */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1b82cd]/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      {/* Bottom Right Gradient */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1b82cd]/20 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* --- Main Content --- */}
      <div className="container mx-auto px-4 text-center relative z-10 py-20">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          
          {/* Header Section */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
              MEDIX
            </h1>
            
            {/* Animated Sub-headers */}
            <div className="h-12 md:h-16 flex items-center justify-center">
              <span className="text-3xl md:text-5xl font-medium text-[#1b82cd]">
                {displayText}
                <span className="ml-1 inline-block w-1 h-8 md:h-12 bg-slate-900 align-middle animate-pulse" />
              </span>
            </div>
            
            <p className="text-lg text-slate-500 max-w-2xl mx-auto pt-4 leading-relaxed">
              Experience the future of healthcare with an AI-powered assistant designed 
              to analyze symptoms and provide professional medical guidance securely.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-8 h-14 rounded-full bg-[#1b82cd] hover:bg-[#156aadd] shadow-lg shadow-blue-200 hover:shadow-xl transition-all duration-300"
              onClick={handleGetStarted}
            >
              <Link href="/dashboard">
                {session ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 h-14 rounded-full border-2 border-slate-200 text-slate-600 hover:border-[#1b82cd] hover:text-[#1b82cd] transition-colors duration-300"
            >
              <Link href="/hipaa">
                Learn More
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </section>
  )
}