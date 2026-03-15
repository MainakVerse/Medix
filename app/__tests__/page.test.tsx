import { render, screen } from '@testing-library/react'
import LandingPage from '../page'

jest.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

jest.mock('@/components/preloader', () => ({
  Preloader: () => <div data-testid="preloader">Preloader</div>,
}))

jest.mock('@/components/landing/hero-section', () => ({
  HeroSection: () => <div data-testid="hero-section">HeroSection</div>,
}))

jest.mock('@/components/landing/problem-section', () => ({
  ProblemSection: () => <div data-testid="problem-section">ProblemSection</div>,
}))

jest.mock('@/components/landing/solutions-section', () => ({
  SolutionsSection: () => <div data-testid="solutions-section">SolutionsSection</div>,
}))

jest.mock('@/components/landing/uniqueness-section', () => ({
  UniquenessSection: () => <div data-testid="uniqueness-section">UniquenessSection</div>,
}))

jest.mock('@/components/landing/faq-section', () => ({
  FAQSection: () => <div data-testid="faq-section">FAQSection</div>,
}))

jest.mock('@/components/landing/testimonials-section', () => ({
  TestimonialsSection: () => <div data-testid="testimonials-section">TestimonialsSection</div>,
}))

jest.mock('@/components/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}))

describe('LandingPage', () => {
  describe('happy path', () => {
    it('should render all sections in correct order when page loads', () => {
      render(<LandingPage />)

      const preloader = screen.getByTestId('preloader')
      const navbar = screen.getByTestId('navbar')
      const heroSection = screen.getByTestId('hero-section')
      const problemSection = screen.getByTestId('problem-section')
      const solutionsSection = screen.getByTestId('solutions-section')
      const uniquenessSection = screen.getByTestId('uniqueness-section')
      const faqSection = screen.getByTestId('faq-section')
      const testimonialsSection = screen.getByTestId('testimonials-section')
      const footer = screen.getByTestId('footer')

      expect(preloader).toBeInTheDocument()
      expect(navbar).toBeInTheDocument()
      expect(heroSection).toBeInTheDocument()
      expect(problemSection).toBeInTheDocument()
      expect(solutionsSection).toBeInTheDocument()
      expect(uniquenessSection).toBeInTheDocument()
      expect(faqSection).toBeInTheDocument()
      expect(testimonialsSection).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })

    it('should render main element with min-h-screen class', () => {
      render(<LandingPage />)

      const main = screen.getByRole('main')
      expect(main).toHaveClass('min-h-screen')
    })

    it('should render preloader before navbar', () => {
      render(<LandingPage />)

      const preloader = screen.getByTestId('preloader')
      const navbar = screen.getByTestId('navbar')

      expect(preloader.compareDocumentPosition(navbar)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('should render footer after main content', () => {
      render(<LandingPage />)

      const main = screen.getByRole('main')
      const footer = screen.getByTestId('footer')

      expect(main.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })

  describe('edge cases', () => {
    it('should render without errors when all mocked components are present', () => {
      expect(() => {
        render(<LandingPage />)
      }).not.toThrow()
    })

    it('should have all sections within the main element', () => {
      render(<LandingPage />)

      const main = screen.getByRole('main')
      const heroSection = screen.getByTestId('hero-section')
      const problemSection = screen.getByTestId('problem-section')
      const solutionsSection = screen.getByTestId('solutions-section')
      const uniquenessSection = screen.getByTestId('uniqueness-section')
      const faqSection = screen.getByTestId('faq-section')
      const testimonialsSection = screen.getByTestId('testimonials-section')

      expect(main).toContainElement(heroSection)
      expect(main).toContainElement(problemSection)
      expect(main).toContainElement(solutionsSection)
      expect(main).toContainElement(uniquenessSection)
      expect(main).toContainElement(faqSection)
      expect(main).toContainElement(testimonialsSection)
    })

    it('should render sections in expected DOM order', () => {
      const { container } = render(<LandingPage />)

      const testIds = [
        'preloader',
        'navbar',
        'hero-section',
        'problem-section',
        'solutions-section',
        'uniqueness-section',
        'faq-section',
        'testimonials-section',
        'footer',
      ]

      const elements = testIds.map((id) => container.querySelector(`[data-testid="${id}"]`))

      for (let i = 0; i < elements.length - 1; i++) {
        const current = elements[i]
        const next = elements[i + 1]

        expect(current).toBeTruthy()
        expect(next).toBeTruthy()
        expect(current!.compareDocumentPosition(next!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
      }
    })
  })
})