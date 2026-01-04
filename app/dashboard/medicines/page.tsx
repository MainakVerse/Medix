"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Pill, AlertTriangle, Info, Clock, TestTube, ShoppingBag, Trash2, Loader2, Stethoscope, ArrowRight, Tag } from "lucide-react"

interface Alternative {
  name: string
  manufacturer: string
  price: string
}

interface MedicineInfo {
  is_symptom_search: boolean
  searched_term: string
  name: string
  category: string
  composition: string
  usage: string
  directions: string
  commercial_names: string[] // New field
  warnings: string[]
  alternatives: Alternative[]
  timestamp: number
}

export default function MedicinesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [medicines, setMedicines] = useState<MedicineInfo[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("medicine_history_v3")
    if (saved) {
      setMedicines(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("medicine_history_v3", JSON.stringify(medicines))
    }
  }, [medicines, isLoaded])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/medicine-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      const newEntry = { ...data, timestamp: Date.now() }
      setMedicines((prev) => [newEntry, ...prev])
      setSearchTerm("") 
    } catch (error) {
      console.error("Error:", error)
      alert("Could not process request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    if (confirm("Clear all search history?")) {
      setMedicines([])
      localStorage.removeItem("medicine_history_v3")
    }
  }

  if (!isLoaded) return null

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground text-balance">Pharma AI Assistant</h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Search for a medicine directly, or describe a symptom to get recommendations.
        </p>
      </div>

      <Card className="border-2 shadow-md">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ex: 'Tylenol' OR 'Severe Headache' OR 'Acid Reflux'..."
                className="pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchTerm} className="h-12 px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {medicines.length > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
        </div>
      )}

      <div className="space-y-8">
        {medicines.map((medicine) => (
          <Card key={medicine.timestamp} className="border-2 hover:border-primary/50 transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            
            <CardHeader className={`border-b ${medicine.is_symptom_search ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-secondary/20'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-sm border ${medicine.is_symptom_search ? 'bg-amber-100 text-amber-700' : 'bg-white dark:bg-primary/10 text-primary'}`}>
                    {medicine.is_symptom_search ? <Stethoscope className="h-8 w-8" /> : <Pill className="h-8 w-8" />}
                  </div>
                  <div>
                    {medicine.is_symptom_search && (
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                            <span>Symptom: {medicine.searched_term}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>Recommended</span>
                        </div>
                    )}
                    <CardTitle className="text-2xl capitalize">{medicine.name}</CardTitle>
                    <CardDescription className="text-base font-medium">
                      {medicine.category}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                        <h4 className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300 mb-2">
                            <TestTube className="h-4 w-4" /> Composition
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed">{medicine.composition}</p>
                        
                        {/* Diagram Trigger */}
                        <div className="mt-4 flex justify-center opacity-90 hover:opacity-100 transition-opacity">
                            
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                            <Info className="h-4 w-4 text-primary" /> Indications
                        </h4>
                        <p className="text-sm text-muted-foreground">{medicine.usage}</p>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                            <Clock className="h-4 w-4 text-primary" /> Directions
                        </h4>
                        <p className="text-sm text-muted-foreground">{medicine.directions}</p>
                    </div>
                  </div>

                  {/* NEW SECTION: Commercial Names (Left Bottom) */}
                  <div className="pt-4 border-t border-dashed">
                     <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
                        <Tag className="h-4 w-4 text-primary" /> Top 5 Commercial Names
                     </h4>
                     <div className="flex flex-wrap gap-2">
                        {medicine.commercial_names?.map((brand, idx) => (
                            <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase rounded-md border border-secondary-foreground/10">
                                {brand}
                            </span>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                   {/* Alternatives Table */}
                   <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted px-4 py-2 font-semibold text-sm flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" /> Price Comparison
                      </div>
                      <div className="divide-y">
                        {medicine.alternatives.map((alt, idx) => (
                            <div key={idx} className="p-3 flex justify-between items-center text-sm hover:bg-muted/50 transition-colors">
                                <div>
                                    <div className="font-medium">{alt.name}</div>
                                    <div className="text-xs text-muted-foreground">{alt.manufacturer}</div>
                                </div>
                                <div className="font-mono font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
                                    {alt.price}
                                </div>
                            </div>
                        ))}
                      </div>
                   </div>

                   {/* Warnings */}
                   <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Important Safety Info
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {medicine.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{warning}</li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}