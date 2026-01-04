"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { LoginModal } from "@/components/auth/loginModal" // Import Modal
import { useSession } from "next-auth/react" // To check if already logged in

export function Navbar() {
  const { data: session } = useSession() // Check auth status
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false) // Modal State

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleGetStarted = (e: React.MouseEvent) => {
    // If logged in, let Link handle navigation. If not, prevent default and show modal.
    if (!session) {
      e.preventDefault()
      setShowLoginModal(true)
    }
  }

  const navLinks = [
    { label: "Home", href: "/#hero" },
    { label: "Solutions", href: "/#solutions" },
    { label: "Why Medix", href: "/#uniqueness" },
    { label: "FAQ", href: "/#faq" },
    { label: "Testimonials", href: "/#testimonials" },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary">Medix</Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="outline"><Link href="/hipaa">Read More</Link></Button>
              
              {/* Conditional Button: Dashboard if logged in, Login Modal if not */}
              <Button asChild onClick={handleGetStarted}>
                <Link href="/dashboard">
                   {session ? "Go to Dashboard" : "Get Started"}
                </Link>
              </Button>
            </div>

            <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile Menu omitted for brevity, implement similar onClick logic there */}
        </div>
      </nav>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}