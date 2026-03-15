import React from "react"
import { render, screen } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import RootLayout from "../layout"
import * as layoutModule from "../layout"

jest.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}))

jest.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="analytics" />,
}))

jest.mock("next/font/google", () => ({
  Roboto: () => ({
    className: "roboto-font-class",
  }),
}))

describe("RootLayout", () => {
  describe("metadata export", () => {
    it("should export metadata with correct title and description", () => {
      const metadata = layoutModule.metadata
      expect(metadata.title).toBe("Medix - Your Medical Agent")
      expect(metadata.description).toContain(
        "AI-powered medical advisory platform"
      )
    })

    it("should include all required metadata fields", () => {
      const metadata = layoutModule.metadata
      expect(metadata.generator).toBe("v0.app")
      expect(metadata.keywords).toEqual(
        expect.arrayContaining([
          "healthcare",
          "medical AI",
          "disease detection",
          "care programs",
          "health advisory",
        ])
      )
    })

    it("should export icons configuration with light and dark mode variants", () => {
      const metadata = layoutModule.metadata
      expect(metadata.icons?.icon).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: "/icon-light-32x32.png",
            media: "(prefers-color-scheme: light)",
          }),
          expect.objectContaining({
            url: "/icon-dark-32x32.png",
            media: "(prefers-color-scheme: dark)",
          }),
          expect.objectContaining({
            url: "/icon.svg",
            type: "image/svg+xml",
          }),
        ])
      )
    })

    it("should export apple icon configuration", () => {
      const metadata = layoutModule.metadata
      expect(metadata.icons?.apple).toBe("/apple-icon.png")
    })
  })

  describe("RootLayout component", () => {
    it("should render html with lang attribute set to en", () => {
      const { container } = render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      )
      const htmlElement = container.querySelector("html")
      expect(htmlElement).toHaveAttribute("lang", "en")
    })

    it("should render body element with roboto font class", () => {
      const { container } = render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      )
      const bodyElement = container.querySelector("body")
      expect(bodyElement).toHaveClass("roboto-font-class")
      expect(bodyElement).toHaveClass("font-sans")
      expect(bodyElement).toHaveClass("antialiased")
    })

    it("should wrap children with SessionProvider", () => {
      render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      )
      const sessionProvider = screen.getByTestId("session-provider")
      expect(sessionProvider).toBeInTheDocument()
    })

    it("should render children inside SessionProvider", () => {
      render(
        <RootLayout>
          <div data-testid="child-content">Test Content</div>
        </RootLayout>
      )
      const childContent = screen.getByTestId("child-content")
      expect(childContent).toBeInTheDocument()
      expect(childContent).toHaveTextContent("Test Content")
    })

    it("should render Analytics component", () => {
      render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      )
      const analytics = screen.getByTestId("analytics")
      expect(analytics).toBeInTheDocument()
    })

    it("should render multiple children correctly", () => {
      render(
        <RootLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </RootLayout>
      )
      expect(screen.getByTestId("child-1")).toBeInTheDocument()
      expect(screen.getByTestId("child-2")).toBeInTheDocument()
    })

    it("should render with ReactNode children type", () => {
      const testChild: React.ReactNode = "String content"
      const { container } = render(
        <RootLayout>{testChild}</RootLayout>
      )
      expect(container.textContent).toContain("String content")
    })

    it("should maintain correct element hierarchy", () => {
      const { container } = render(
        <RootLayout>
          <div data-testid="test-child">Test</div>
        </RootLayout>
      )
      const html = container.querySelector("html")
      const body = html?.querySelector("body")
      const sessionProvider = body?.querySelector("[data-testid='session-provider']")
      expect(sessionProvider).toBeInTheDocument()
    })

    it("should handle empty children gracefully", () => {
      const { container } = render(
        <RootLayout>{null}</RootLayout>
      )
      const html = container.querySelector("html")
      expect(html).toBeInTheDocument()
    })

    it("should render with fragment children", () => {
      render(
        <RootLayout>
          <>
            <div data-testid="frag-child-1">Fragment Child 1</div>
            <div data-testid="frag-child-2">Fragment Child 2</div>
          </>
        </RootLayout>
      )
      expect(screen.getByTestId("frag-child-1")).toBeInTheDocument()
      expect(screen.getByTestId("frag-child-2")).toBeInTheDocument()
    })

    it("should be marked as default export", () => {
      expect(layoutModule.default).toBe(RootLayout)
    })
  })

  describe("edge cases and error handling", () => {
    it("should handle metadata access when metadata property exists", () => {
      expect(() => {
        const _ = layoutModule.metadata
      }).not.toThrow()
    })

    it("should not throw when rendering with complex nested structure", () => {
      expect(() => {
        render(
          <RootLayout>
            <div>
              <section>
                <article>
                  <p>Complex nested content</p>
                </article>
              </section>
            </div>
          </RootLayout>
        )
      }).not.toThrow()
    })

    it("should preserve all CSS classes on body element", () => {
      const { container } = render(
        <RootLayout>
          <div>Content</div>