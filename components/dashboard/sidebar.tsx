"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Search, Heart, Pill, Leaf, FileText, Settings, Activity, Loader2, LogOut } from "lucide-react" // Added LogOut
import { signOut } from "next-auth/react" // Added signOut

export function DashboardSidebar() {
  const pathname = usePathname()
  
  const [user, setUser] = useState({
    name: "User",
    email: "user@medix.com",
    initials: "U"
  })
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        
        // Logic for First + Last Name
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User"
        
        setUser({
          name: fullName,
          email: data.email || "user@medix.com",
          initials: data.first_name ? data.first_name[0].toUpperCase() : "U"
        })
      }
    } catch (error) {
      console.error("Failed to load sidebar profile", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserProfile()
    // Listen for updates from Settings Page
    window.addEventListener("profile-updated", fetchUserProfile)
    return () => window.removeEventListener("profile-updated", fetchUserProfile)
  }, [])

  const menuItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Search, label: "Disease Detection", href: "/dashboard/detection" },
    // { icon: Heart, label: "Care Program", href: "/dashboard/care-program" },
    { icon: Pill, label: "Medicines", href: "/dashboard/medicines" },
    { icon: Leaf, label: "Remedies", href: "/dashboard/remedies" },
    { icon: FileText, label: "Generate Prescription", href: "/dashboard/prescription" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" }) // Redirects to home page after logout
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-sidebar-primary" />
          <span className="text-2xl font-bold text-sidebar-foreground">Medix</span>
        </Link>
      </div>

      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 bg-sidebar-primary text-sidebar-primary-foreground">
            <AvatarFallback>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {loading ? (
                <div className="space-y-2">
                    <div className="h-4 w-24 bg-sidebar-accent/50 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-sidebar-accent/30 rounded animate-pulse" />
                </div>
            ) : (
                <>
                    <p className="text-sm font-semibold text-sidebar-foreground truncate" title={user.name}>
                        {user.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate" title={user.email}>
                        {user.email}
                    </p>
                </>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col justify-between">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* LOGOUT BUTTON */}
        <div className="px-3 mt-4">
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
            >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Log out</span>
            </button>
        </div>
      </nav>

      <div className="p-6 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/60 text-center">&copy; {new Date().getFullYear()} Medix</p>
      </div>
    </aside>
  )
}