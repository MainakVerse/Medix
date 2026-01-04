"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Leaf, Coffee, Moon, Activity, Apple, Droplets, Search, Sparkles, Loader2, ArrowRight, History, X, Calendar } from "lucide-react"

// Interface for AI Response
interface AiRemedyResult {
  title: string
  intro: string
  remedies: {
    name: string
    instruction: string
    why: string
  }[]
  lifestyle_tip: string
  caution: string
}

interface RemedyHistoryItem {
    id: number
    query: string
    result_data: AiRemedyResult
    created_at: string
}

export default function RemediesPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AiRemedyResult | null>(null)
  const [userId, setUserId] = useState<string>("")
  
  // History State
  const [historyList, setHistoryList] = useState<RemedyHistoryItem[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // Loading Text Animation State
  const [loadingText, setLoadingText] = useState("Analyzing symptoms...")
  
  // 1. Initialize User ID & Fetch History on Mount
  useEffect(() => {
      // Check if we already have a user ID in local storage
      let storedId = localStorage.getItem("remedy_user_id")
      
      // If not, generate a random one (simulating a "guest" login)
      if (!storedId) {
          storedId = "user_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
          localStorage.setItem("remedy_user_id", storedId)
      }
      
      setUserId(storedId)
      fetchHistory(storedId)
  }, [])

  // 2. Updated Fetch History (Requires User ID)
  const fetchHistory = async (currentUserId: string) => {
      if (!currentUserId) return
      try {
          const res = await fetch("/api/remedies", {
              headers: { 
                  "x-user-id": currentUserId // <--- Auth Header
              }
          })
          const data = await res.json()
          if(Array.isArray(data)) setHistoryList(data)
      } catch (e) { console.error(e) }
  }

  // Animation Logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      const messages = ["Analyzing symptoms...", "Asking the Medics...", "Getting your remedies..."]
      let i = 0
      setLoadingText(messages[0])
      interval = setInterval(() => {
        i = (i + 1) % messages.length
        setLoadingText(messages[i])
      }, 1200) 
    }
    return () => clearInterval(interval)
  }, [loading])

  // 3. Updated Ask AI (Requires User ID)
  const handleAskAI = async () => {
    if (!query.trim() || !userId) return
    setLoading(true)
    setAiResult(null)

    try {
      const res = await fetch("/api/remedies", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-user-id": userId // <--- Auth Header
        },
        body: JSON.stringify({ query }),
      })
      
      if (!res.ok) throw new Error("Failed")

      const data = await res.json()
      setAiResult(data)
      fetchHistory(userId) // Refresh history list after new generation
    } catch (err) {
      console.error(err)
      alert("Could not fetch remedies. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadFromHistory = (item: RemedyHistoryItem) => {
      setAiResult(item.result_data)
      setIsHistoryOpen(false)
  }

  // Static Data
  const remedies = [
    {
      category: "Cold & Flu",
      icon: Leaf,
      color: "text-green-600",
      bgColor: "bg-green-50",
      items: [
        { remedy: "Honey & Ginger Tea", benefit: "Soothes throat and reduces inflammation" },
        { remedy: "Steam Inhalation", benefit: "Clears nasal congestion" },
        { remedy: "Warm Salt Water Gargle", benefit: "Reduces throat irritation" },
      ],
    },
    {
      category: "Digestive Health",
      icon: Apple,
      color: "text-red-600",
      bgColor: "bg-red-50",
      items: [
        { remedy: "Peppermint Tea", benefit: "Eases stomach discomfort" },
        { remedy: "Probiotic Yogurt", benefit: "Supports gut health" },
        { remedy: "Ginger Root", benefit: "Reduces nausea" },
      ],
    },
  ]

  return (
    <div className="relative flex min-h-screen">
      
      {/* MAIN CONTENT */}
      <div className={`flex-1 space-y-8 max-w-6xl mx-auto p-4 transition-all duration-300 ${isHistoryOpen ? "pr-80" : ""}`}>
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground text-balance">Natural Remedies</h1>
                <p className="text-lg text-muted-foreground text-pretty">
                Lifestyle and home remedies for common health concerns
                </p>
            </div>
            <Button variant="outline" onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={isHistoryOpen ? "bg-secondary" : ""}>
                <History className="mr-2 h-4 w-4" /> 
                {isHistoryOpen ? "Close History" : "Past Searches"}
            </Button>
        </div>

        {/* SEARCH SECTION */}
        <Card className="border-2 border-primary/20 shadow-sm">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-amber-500" /> 
                Ask for a Specific Remedy
            </CardTitle>
            <CardDescription>Describe your issue (e.g., "Sore throat", "Sunburn", "Hiccups")</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-3">
                    <Input 
                        placeholder="What's bothering you today?" 
                        className="text-lg h-12"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                    />
                    <Button onClick={handleAskAI} disabled={loading || !query} className="h-12 px-6 text-md">
                        {loading ? <Loader2 className="animate-spin" /> : "Find Remedies"}
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* AI RESULT SECTION */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-muted/20 rounded-xl border border-dashed animate-pulse">
                <div className="relative">
                    <Leaf className="h-12 w-12 text-green-500 animate-bounce" />
                </div>
                <p className="text-lg font-medium text-muted-foreground animate-fade-in">{loadingText}</p>
            </div>
        )}

        {aiResult && !loading && (
            <Card className="border-2 border-green-600/30 bg-green-50/30 dark:bg-green-950/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="bg-green-100/50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
                    <CardTitle className="text-2xl text-green-800 dark:text-green-300">{aiResult.title}</CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-400 text-base">{aiResult.intro}</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2 text-lg">
                                <Leaf className="h-5 w-5 text-green-600" /> Recommended Remedies
                            </h4>
                            <div className="space-y-3">
                                {aiResult.remedies.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white dark:bg-card rounded-lg border shadow-sm">
                                        <h5 className="font-bold text-foreground">{item.name}</h5>
                                        <p className="text-sm text-muted-foreground mt-1 mb-2">{item.instruction}</p>
                                        <div className="flex items-start gap-2 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                            <Sparkles className="h-3 w-3 mt-0.5" />
                                            {item.why}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Lifestyle Tip
                                </h4>
                                <p className="text-sm text-foreground">{aiResult.lifestyle_tip}</p>
                            </div>

                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                                <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" /> Caution
                                </h4>
                                <p className="text-sm text-muted-foreground">{aiResult.caution}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* STATIC REMEDIES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {remedies.map((category, index) => {
            const Icon = category.icon
            return (
                <Card key={index} className="border-2 hover:border-primary transition-all">
                <CardHeader>
                    <div className="flex items-center gap-3">
                    <div className={`p-3 ${category.bgColor} rounded-lg`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle>{category.category}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {category.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-secondary/50 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-1">{item.remedy}</h4>
                        <p className="text-sm text-muted-foreground">{item.benefit}</p>
                        </div>
                    ))}
                    </div>
                </CardContent>
                </Card>
            )
            })}
        </div>
      </div>

      {/* HISTORY SIDEBAR */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-background border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                 <History className="h-5 w-5" /> Recent Searches
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)}>
                 <X className="h-4 w-4" />
              </Button>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {historyList.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No saved history.</p>
                 </div>
              ) : (
                historyList.map((item) => (
                    <Card 
                      key={item.id} 
                      onClick={() => loadFromHistory(item)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-transparent hover:border-l-green-500"
                    >
                       <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                             <span className="font-semibold text-sm truncate">{item.query}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                             <Calendar className="h-3 w-3" />
                             {new Date(item.created_at).toLocaleDateString()}
                          </div>
                       </CardContent>
                    </Card>
                ))
              )}
           </div>
        </div>
      </div>

    </div>
  )
}