import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  )
}
