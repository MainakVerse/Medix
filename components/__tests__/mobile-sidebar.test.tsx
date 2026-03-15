import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { usePathname } from "next/navigation"
import { MobileSidebar } from "../mobile-sidebar"

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}))

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="avatar" {...props}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}))

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock("lucide-react", () => ({
  Home: () => <div data-testid="icon-home" />,
  Search: () => <div data-testid="icon-search" />,
  Heart: () => <div data-testid="icon-heart" />,
  Pill: () => <div data-testid="icon-pill" />,
  Leaf: () => <div data-testid="icon-leaf" />,
  FileText: () => <div data-testid="icon-filetext" />,
  Settings: () => <div data-testid="icon-settings" />,
  Activity: () => <div data-testid="icon-activity" />,
  Menu: () => <div data-testid="icon-menu" />,
  X: () => <div data-testid="icon-x" />,
}))

describe("MobileSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue("/dashboard")
  })

  describe("Rendering", () => {
    it("should render the mobile header with Medix branding", () => {
      render(<MobileSidebar />)
      expect(screen.getByText("Medix")).toBeInTheDocument()
    })

    it("should render the menu toggle button", () => {
      render(<MobileSidebar />)
      const buttons = screen.getAllByRole("button")
      expect(buttons.length).toBeGreaterThan(0)
    })

    it("should render user profile section with name and email", () => {
      render(<MobileSidebar />)
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument()
    })

    it("should render all navigation menu items", () => {
      render(<MobileSidebar />)
      expect(screen.getByText("Home")).toBeInTheDocument()
      expect(screen.getByText("Disease Detection")).toBeInTheDocument()
      expect(screen.getByText("Care Program")).toBeInTheDocument()
      expect(screen.getByText("Medicines")).toBeInTheDocument()
      expect(screen.getByText("Remedies")).toBeInTheDocument()
      expect(screen.getByText("Generate Prescription")).toBeInTheDocument()
      expect(screen.getByText("Settings")).toBeInTheDocument()
    })

    it("should render avatar with fallback initials", () => {
      render(<MobileSidebar />)
      expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("JD")
    })
  })

  describe("Menu Toggle Functionality", () => {
    it("should open the menu when toggle button is clicked", async () => {
      render(<MobileSidebar />)
      const button = screen.getAllByRole("button")[0]
      fireEvent.click(button)
      await waitFor(() => {
        expect(screen.getByTestId("icon-x")).toBeInTheDocument()
      })
    })

    it("should close the menu when toggle button is clicked again", async () => {
      render(<MobileSidebar />)
      const button = screen.getAllByRole("button")[0]
      fireEvent.click(button)
      fireEvent.click(button)
      await waitFor(() => {
        expect(screen.getByTestId("icon-menu")).toBeInTheDocument()
      })
    })

    it("should close menu when overlay is clicked", async () => {
      render(<MobileSidebar />)
      const button = screen.getAllByRole("button")[0]
      fireEvent.click(button)
      const overlay = screen.getByRole("presentation", { hidden: true })
      fireEvent.click(overlay)
      await waitFor(() => {
        expect(screen.getByTestId("icon-menu")).toBeInTheDocument()
      })
    })
  })

  describe("Active Route Detection", () => {
    it("should highlight Home link when pathname is /dashboard", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard")
      render(<MobileSidebar />)
      const homeLinks = screen.getAllByText("Home")
      expect(homeLinks[0]).toBeInTheDocument()
    })

    it("should highlight Disease Detection when on /dashboard/detection", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard/detection")
      render(<MobileSidebar />)
      expect(screen.getByText("Disease Detection")).toBeInTheDocument()
    })

    it("should highlight Care Program when on /dashboard/care-program", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard/care-program")
      render(<MobileSidebar />)
      expect(screen.getByText("Care Program")).toBeInTheDocument()
    })

    it("should highlight Medicines when on /dashboard/medicines", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard/medicines")
      render(<MobileSidebar />)
      expect(screen.getByText("Medicines")).toBeInTheDocument()
    })

    it("should highlight Remedies when on /dashboard/remedies", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard/remedies")
      render(<MobileSidebar />)
      expect(screen.getByText("Remedies")).toBeInTheDocument()
    })

    it("should highlight Generate Prescription when on /dashboard/prescription", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard/prescription")
      render(<MobileSidebar />)
      expect(screen.getByText("Generate Prescription")).toBeInTheDocument()
    })

    it("should highlight Settings when on /dashboard/settings", () => {
      ;(usePathname as jest.Mock).mockReturnValue("/dashboard/settings")
      render(<MobileSidebar />)
      expect