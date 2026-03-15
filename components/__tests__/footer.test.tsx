import React from "react"
import { render, screen } from "@testing-library/react"
import { Footer } from "../footer"

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe("Footer", () => {
  describe("happy path", () => {
    it("should render footer with all navigation links", () => {
      render(<Footer />)

      const privacyLink = screen.getByRole("link", { name: /privacy policy/i })
      const hipaaLink = screen.getByRole("link", { name: /hipaa compliance/i })
      const termsLink = screen.getByRole("link", { name: /terms of use/i })
      const disclaimerLink = screen.getByRole("link", { name: /disclaimer/i })

      expect(privacyLink).toBeInTheDocument()
      expect(hipaaLink).toBeInTheDocument()
      expect(termsLink).toBeInTheDocument()
      expect(disclaimerLink).toBeInTheDocument()
    })

    it("should render links with correct href attributes", () => {
      render(<Footer />)

      const privacyLink = screen.getByRole("link", { name: /privacy policy/i })
      const hipaaLink = screen.getByRole("link", { name: /hipaa compliance/i })
      const termsLink = screen.getByRole("link", { name: /terms of use/i })
      const disclaimerLink = screen.getByRole("link", { name: /disclaimer/i })

      expect(privacyLink).toHaveAttribute("href", "/privacy")
      expect(hipaaLink).toHaveAttribute("href", "/hipaa")
      expect(termsLink).toHaveAttribute("href", "/terms")
      expect(disclaimerLink).toHaveAttribute("href", "/disclaimer")
    })

    it("should display Medix branding", () => {
      render(<Footer />)

      const branding = screen.getByText("Medix")
      expect(branding).toBeInTheDocument()
    })

    it("should display copyright year dynamically", () => {
      render(<Footer />)

      const currentYear = new Date().getFullYear().toString()
      const copyrightText = screen.getByText(new RegExp(`© ${currentYear} Medix`))

      expect(copyrightText).toBeInTheDocument()
    })

    it("should display medical disclaimer text", () => {
      render(<Footer />)

      const disclaimerText = screen.getByText(/Medical Disclaimer:/i)
      expect(disclaimerText).toBeInTheDocument()

      const disclaimerContent = screen.getByText(
        /Medix is an educational and advisory platform\. It is not a substitute for professional medical advice/i
      )
      expect(disclaimerContent).toBeInTheDocument()
    })

    it("should render all footer sections", () => {
      const { container } = render(<Footer />)

      const footerElement = container.querySelector("footer")
      expect(footerElement).toBeInTheDocument()

      const nav = container.querySelector("nav")
      expect(nav).toBeInTheDocument()
    })
  })

  describe("edge cases", () => {
    it("should have correct number of navigation links", () => {
      render(<Footer />)

      const links = screen.getAllByRole("link")
      expect(links).toHaveLength(4)
    })

    it("should have correct CSS classes applied", () => {
      const { container } = render(<Footer />)

      const footer = container.querySelector("footer")
      expect(footer).toHaveClass("bg-card", "border-t", "border-border", "py-12")
    })

    it("should display all required disclaimer content", () => {
      render(<Footer />)

      const allRightsReserved = screen.getByText(/all rights reserved/i)
      expect(allRightsReserved).toBeInTheDocument()

      const qualifiedHealthcare = screen.getByText(/qualified healthcare provider/i)
      expect(qualifiedHealthcare).toBeInTheDocument()
    })

    it("should maintain proper text hierarchy with headings", () => {
      render(<Footer />)

      const branding = screen.getByText("Medix")
      expect(branding.tagName).not.toBe("H1")
    })

    it("should render footer with expected structure containing all text nodes", () => {
      const { container } = render(<Footer />)

      const footerText = container.textContent
      expect(footerText).toContain("Medix")
      expect(footerText).toContain("Privacy Policy")
      expect(footerText).toContain("HIPAA Compliance")
      expect(footerText).toContain("Terms of Use")
      expect(footerText).toContain("Disclaimer")
      expect(footerText).toContain("Medical Disclaimer")
      expect(footerText).toContain("substitute for professional medical advice")
    })
  })
})