"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Search, Heart, Pill, FileText, ArrowRight, ClipboardList, Sparkles, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react" // ✅ Use Session to personalize greeting

// Helper to format timestamp
const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr).getTime();
  const seconds = Math.floor((new Date().getTime() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"
  return "Just now"
}

export default function DashboardHomePage() {
  const { data: session } = useSession() // ✅ Get User Session
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dashboard Metrics State
  const [stats, setStats] = useState({
    savedPrescriptions: 0,
    symptomChecks: 0,
    healthScore: 100, // Default good score
    activePrograms: 0
  })

  // Activity Feed State
  const [activities, setActivities] = useState<{
    id: string
    action: string
    detail: string
    time: string
    href: string
    icon: any
    color: string
  }[]>([])

  useEffect(() => {
    setMounted(true)
    const loadDashboardData = async () => {
        try {
            // 1. Fetch Real Data from APIs (Now secured by Auth)
            const [digitalRes, uploadRes, historyRes] = await Promise.all([
                fetch("/api/saved-prescriptions"),
                fetch("/api/prescriptions"),
                fetch("/api/history") // New route we created above
            ]);
            
            const digitalData = await digitalRes.json();
            const uploadData = await uploadRes.json();
            const historyData = await historyRes.json();
            
            const digitalCount = Array.isArray(digitalData) ? digitalData.length : 0;
            const uploadCount = Array.isArray(uploadData) ? uploadData.length : 0;
            
            // --- AGGREGATE ACTIVITIES FROM DB ---
            let allActivities: any[] = []

            // Add Digital Rx to Feed
            if (historyData.digitalRx) {
                historyData.digitalRx.forEach((item: any) => {
                    allActivities.push({
                        id: `rx-${item.id}`,
                        action: "Prescription Draft",
                        detail: `Saved for: ${item.patient_name} (${item.diagnosis})`,
                        rawTime: new Date(item.created_at).getTime(),
                        time: timeAgo(item.created_at),
                        href: "/dashboard/prescription",
                        icon: FileText,
                        color: "text-blue-600"
                    })
                })
            }

            // Add Uploads to Feed
            if (historyData.uploads) {
                historyData.uploads.forEach((item: any) => {
                    allActivities.push({
                        id: `up-${item.id}`,
                        action: "Document Upload",
                        detail: `Uploaded scan for: ${item.patient_name}`,
                        rawTime: new Date(item.created_at).getTime(),
                        time: timeAgo(item.created_at),
                        href: "/dashboard/prescription",
                        icon: ImageIcon,
                        color: "text-orange-600"
                    })
                })
            }

            // Sort by newest first
            allActivities.sort((a, b) => b.rawTime - a.rawTime)
            setActivities(allActivities.slice(0, 5))

            // Update Stats
            setStats({
                savedPrescriptions: digitalCount + uploadCount,
                symptomChecks: 0, // Placeholder until we link detections table
                healthScore: 92, // Static positive reinforcement
                activePrograms: 0
            })

        } catch (error) {
            console.error("Failed to load dashboard", error);
        } finally {
            setIsLoading(false);
        }
    }

    loadDashboardData();
  }, [])

  const quickActions = [
    {
      icon: Search,
      title: "Disease Detection",
      description: "Analyze symptoms and get insights",
      href: "/dashboard/detection",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FileText, 
      title: "Prescription Manager", 
      description: "Manage drafts and upload records", 
      href: "/dashboard/prescription", 
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Pill,
      title: "Medicines",
      description: "Learn about medications",
      href: "/dashboard/medicines",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Sparkles, 
      title: "Natural Remedies",
      description: "Holistic health suggestions",
      href: "/dashboard/remedies",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  if (!mounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header - Personalized */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground text-balance">
            Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Access your personalized health tools and track your wellness journey
        </p>
      </div>

      {/* Health Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Saved Prescriptions Card */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Saved Prescriptions</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
                {isLoading ? "-" : stats.savedPrescriptions}
                <FileText className="h-6 w-6 text-blue-500 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              <span>Digital & Scanned Records</span>
            </div>
          </CardContent>
        </Card>

        {/* Health Score Card */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Wellness Score</CardDescription>
            <CardTitle className={`text-3xl text-green-600`}>
                {stats.healthScore}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-green-600" />
              <span>Based on consistent activity</span>
            </div>
          </CardContent>
        </Card>

        {/* Generic Action Card */}
        <Card className="border-2 shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardDescription>Quick Start</CardDescription>
            <CardTitle className="text-lg text-primary">Need a Checkup?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button size="sm" asChild className="w-full">
                <Link href="/dashboard/detection">Start Analysis <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg group cursor-pointer"
              >
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-lg ${action.bgColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                    <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                      <span className="text-sm font-medium">Start</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity (Now Real DB Data) */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest saved health records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {activities.length === 0 ? (
                 <div className="text-center py-8 space-y-2">
                    <p className="text-sm text-muted-foreground italic">No recent activity found.</p>
                    <Button variant="link" size="sm" asChild>
                        <Link href="/dashboard/detection">Run your first analysis</Link>
                    </Button>
                 </div>
              ) : (
                activities.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                        <Link key={activity.id} href={activity.href} className="block group">
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className={`p-2 rounded-full bg-secondary ${activity.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {activity.action}
                                        </p>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            {activity.time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{activity.detail}</p>
                                </div>
                            </div>
                        </Link>
                    )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Tips */}
        <Card className="border-2 bg-primary/5">
          <CardHeader>
            <CardTitle>Health Tip of the Day</CardTitle>
            <CardDescription>Preventive care advice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">
                Staying hydrated is essential for optimal body function. Aim for 8 glasses of water daily to support
                digestion, circulation, and cognitive performance.
              </p>
              <div className="p-4 bg-background rounded-lg border border-primary/20">
                 <h4 className="text-sm font-semibold mb-2">Did you know?</h4>
                 <p className="text-xs text-muted-foreground">
                    Even mild dehydration (1-3% of body weight) can impair energy levels and mood.
                 </p>
              </div>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/dashboard/remedies">Find More Remedies</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Disclaimer */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <p className="text-sm text-foreground/80">
            <strong className="text-foreground">Medical Disclaimer:</strong> Medix is an educational and advisory
            platform. Information provided is not a substitute for professional medical advice, diagnosis, or treatment.
            Always consult your healthcare provider for medical concerns.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}