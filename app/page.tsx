import { Navbar } from "@/components/navbar"
import { Preloader } from "@/components/preloader"
import { HeroSection } from "@/components/landing/hero-section"
import { ProblemSection } from "@/components/landing/problem-section"
import { SolutionsSection } from "@/components/landing/solutions-section"
import { UniquenessSection } from "@/components/landing/uniqueness-section"
import { FAQSection } from "@/components/landing/faq-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <>
      <Preloader />
      <Navbar />
      <main className="min-h-screen">
        <HeroSection />
        <ProblemSection />
        <SolutionsSection />
        <UniquenessSection />
        <FAQSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
