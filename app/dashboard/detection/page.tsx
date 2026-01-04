"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Activity, Brain, FilePlus, RefreshCcw, Save, History, ChevronRight, X, Calendar, 
  Stethoscope, CheckCircle2, XCircle, Utensils, AlertTriangle, Pill, ClipboardList 
} from "lucide-react"
import { useRouter } from "next/navigation"

// Updated Interface to match the new API response structure
interface DiagnosisResult {
  status: "incomplete" | "complete"
  followup_questions?: string[]
  diagnosis?: {
    name: string
    system: string
    confidence: number
    causes: string[]
    medical_suggestions: string[] // New
    guidelines: { dos: string[]; donts: string[] } // New
    food_instructions: { allowed: string[]; avoid: string[] } // New
    remedies: string[]
    medicines: {
      composition: string
      brands: string[]
      dosage_instruction: string
    }[]
    care_plan: {
      type: "Acute" | "Chronic"
      timeline: { period: string; action: string }[]
    }
  }
}

interface DetectionHistoryItem {
  id: number
  diagnosis_name: string
  confidence: number
  created_at: string
  result_data: DiagnosisResult
}

export default function DetectionPage() {
  const router = useRouter()
  
  // Core State
  const [symptoms, setSymptoms] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  
  // History Sidebar State
  const [pastDetections, setPastDetections] = useState<DetectionHistoryItem[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  
  // UI State
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingText, setLoadingText] = useState("Analyzing symptoms...")

  // 1. Load LocalStorage & Fetch DB History on Mount
  useEffect(() => {
    const savedData = localStorage.getItem("medical_assistant_data")
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setSymptoms(parsed.symptoms || "")
      setResult(parsed.result || null)
      setHistory(parsed.history || [])
    }
    setIsLoaded(true)
    fetchDetectionHistory()
  }, [])

  // 2. Persist to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { symptoms, result, history }
      localStorage.setItem("medical_assistant_data", JSON.stringify(dataToSave))
    }
  }, [symptoms, result, history, isLoaded])

  // 3. Loading Animation Cycle
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnalyzing) {
      const messages = ["Analyzing symptoms...", "Consulting medical database...", "Verifying biological systems...", "Drafting care plan..."]
      let i = 0
      setLoadingText(messages[0])
      interval = setInterval(() => {
        i = (i + 1) % messages.length
        setLoadingText(messages[i])
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isAnalyzing])

  // API Calls
  const fetchDetectionHistory = async () => {
    try {
      const res = await fetch("/api/detections")
      const data = await res.json()
      if (Array.isArray(data)) setPastDetections(data)
    } catch (e) {
      console.error("Failed to load history", e)
    }
  }

  const saveDetectionToDB = async (data: DiagnosisResult) => {
    if (!data.diagnosis) return
    try {
      await fetch("/api/detections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis_name: data.diagnosis.name,
          confidence: data.diagnosis.confidence,
          result_data: data
        })
      })
      fetchDetectionHistory()
    } catch (e) {
      console.error("Failed to save detection", e)
    }
  }

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return
    setIsAnalyzing(true)
    setResult(null) 
    
    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, history }),
      })
      const data: DiagnosisResult = await response.json()
      
      const newHistoryItem = { role: "user", content: symptoms }
      const modelResponseItem = { role: "model", content: JSON.stringify(data) }
      setHistory(prev => [...prev, newHistoryItem, modelResponseItem])
      
      if (data.status === "incomplete") {
        setSymptoms("") 
      }
      
      setResult(data)

      if (data.status === "complete") {
        await saveDetectionToDB(data)
      }

    } catch (error) { 
      console.error(error) 
    } finally { 
      setIsAnalyzing(false) 
    }
  }

  const handleAddToPrescription = () => {
    if (!result?.diagnosis) return;
    const prescriptionData = {
        diagnosisName: result.diagnosis.name,
        symptoms: symptoms || "Symptoms analyzed via AI conversation.",
        medicines: result.diagnosis.medicines,
        timestamp: new Date().toISOString()
    }
    localStorage.setItem("pending_prescription", JSON.stringify(prescriptionData))
    router.push("/dashboard/prescription")
  }

  const handleRestart = () => {
    setResult(null)
    setSymptoms("")
    setHistory([])
    localStorage.removeItem("medical_assistant_data")
  }

  const loadFromHistory = (item: DetectionHistoryItem) => {
    setResult(item.result_data)
    setIsHistoryOpen(false)
  }

  if (!isLoaded) return null

  const showInput = !result?.diagnosis || result?.status === "incomplete"

  return (
    <div className="relative flex min-h-screen">
      
      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 space-y-8 max-w-5xl mx-auto p-4 transition-all duration-300 ${isHistoryOpen ? "pr-80" : ""}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground text-balance">Disease Detection AI</h1>
              <p className="text-lg text-muted-foreground text-pretty">Powered by Gemini 2.0 Flash</p>
          </div>
          
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={isHistoryOpen ? "bg-secondary" : ""}>
                <History className="mr-2 h-4 w-4" /> 
                {isHistoryOpen ? "Close History" : "Previous Detections"}
             </Button>
             
             {(history.length > 0 || result) && (
                  <Button variant="ghost" onClick={handleRestart}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> New
                  </Button>
             )}
          </div>
        </div>

        {/* INPUT SECTION */}
        {showInput && !isAnalyzing && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>{result?.status === "incomplete" ? "Follow-up Questions" : "Describe Symptoms"}</CardTitle>
                <CardDescription>
                    <span className="flex items-center gap-1 text-xs text-green-600 mt-1"><Save className="h-3 w-3" /> Auto-saving progress</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result?.status === "incomplete" && result.followup_questions && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Please clarify:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">{result.followup_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="symptoms">Your Response</Label>
                  <Textarea 
                      id="symptoms" 
                      placeholder={result?.status === "incomplete" ? "Answering questions..." : "Describe pain, fever, etc..."} 
                      className="min-h-32" 
                      value={symptoms} 
                      onChange={(e) => setSymptoms(e.target.value)} 
                  />
                </div>
                <Button onClick={handleAnalyze} disabled={!symptoms} className="w-full md:w-auto">
                   <Brain className="mr-2 h-4 w-4" /> Analyze
                </Button>
              </CardContent>
            </Card>
        )}

        {/* LOADING STATE */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-muted/20 rounded-xl border border-dashed animate-pulse">
              <Activity className="h-12 w-12 text-primary animate-pulse" />
              <p className="text-lg font-medium text-muted-foreground">{loadingText}</p>
          </div>
        )}

        {/* RESULT SECTION */}
        {result?.status === "complete" && result.diagnosis && !isAnalyzing && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* 1. Main Diagnosis Card */}
               <Card className="border-l-4 border-l-primary shadow-lg bg-primary/5">
                  <CardHeader>
                      <div className="flex justify-between items-start">
                          <div>
                              <CardTitle className="text-2xl text-primary">{result.diagnosis.name}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                  <Activity className="h-4 w-4" /> {result.diagnosis.system} System • {result.diagnosis.confidence}% Confidence
                              </CardDescription>
                          </div>
                          <Button onClick={handleAddToPrescription} className="bg-primary hover:bg-primary/90 shadow-md">
                              <FilePlus className="mr-2 h-4 w-4" /> Add to Prescription
                          </Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                     <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <h4 className="font-semibold mb-2">Possible Causes:</h4>
                            <ul className="list-disc list-inside text-muted-foreground text-sm">
                              {result.diagnosis.causes.map((cause, i) => <li key={i}>{cause}</li>)}
                            </ul>
                         </div>
                         <div className="bg-background/50 p-4 rounded-lg border">
                             <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-primary" /> Medical Suggestions
                             </h4>
                             <ul className="space-y-2">
                                {result.diagnosis.medical_suggestions?.map((sug, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <ChevronRight className="h-3 w-3 mt-1 flex-shrink-0" /> {sug}
                                    </li>
                                ))}
                             </ul>
                         </div>
                     </div>
                  </CardContent>
               </Card>

               {/* 2. Guidelines & Diet Grid */}
               <div className="grid md:grid-cols-2 gap-6">
                  {/* Guidelines */}
                  <Card className="border-2">
                      <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-500" /> Dos & Don'ts
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                              <h5 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Recommended
                              </h5>
                              <ul className="space-y-1">
                                  {result.diagnosis.guidelines?.dos?.map((item, i) => (
                                      <li key={i} className="text-sm text-muted-foreground border-l-2 border-green-200 pl-2">{item}</li>
                                  ))}
                              </ul>
                          </div>
                          <div>
                              <h5 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> Avoid
                              </h5>
                              <ul className="space-y-1">
                                  {result.diagnosis.guidelines?.donts?.map((item, i) => (
                                      <li key={i} className="text-sm text-muted-foreground border-l-2 border-red-200 pl-2">{item}</li>
                                  ))}
                              </ul>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Food Instructions */}
                  <Card className="border-2">
                      <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                              <Utensils className="h-5 w-5 text-blue-500" /> Dietary Guide
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <span className="font-semibold text-green-700 dark:text-green-400 text-sm block mb-1">Eat/Drink:</span>
                              <div className="flex flex-wrap gap-2">
                                  {result.diagnosis.food_instructions?.allowed?.map((food, i) => (
                                      <span key={i} className="px-2 py-1 bg-white dark:bg-black/20 text-xs rounded-md shadow-sm">{food}</span>
                                  ))}
                              </div>
                          </div>
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                              <span className="font-semibold text-red-700 dark:text-red-400 text-sm block mb-1">Strictly Avoid:</span>
                              <div className="flex flex-wrap gap-2">
                                  {result.diagnosis.food_instructions?.avoid?.map((food, i) => (
                                      <span key={i} className="px-2 py-1 bg-white dark:bg-black/20 text-xs rounded-md shadow-sm">{food}</span>
                                  ))}
                              </div>
                          </div>
                      </CardContent>
                  </Card>
               </div>

               {/* 3. Medicines & Care Plan */}
               <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Pill className="h-5 w-5 text-blue-500" /> Prescribed Medication</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          {result.diagnosis.medicines.map((med, i) => (
                          <div key={i} className="p-3 bg-secondary/30 rounded-lg border">
                              <div className="font-semibold text-foreground">{med.composition}</div>
                              <div className="text-xs text-muted-foreground mb-1">{med.dosage_instruction}</div>
                              <div className="text-xs text-blue-600">Brands: {med.brands.join(", ")}</div>
                          </div>
                          ))}
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ClipboardList className="h-5 w-5 text-green-500" /> Care Program</CardTitle></CardHeader>
                      <CardContent>
                          <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
                          {result.diagnosis.care_plan.timeline.map((step, i) => (
                              <div key={i} className="relative pl-6">
                              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                              <div className="text-sm font-bold text-primary">{step.period}</div>
                              <div className="text-sm text-muted-foreground">{step.action}</div>
                              </div>
                          ))}
                          </div>
                      </CardContent>
                  </Card>
               </div>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE SIDEBAR */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-background border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                 <History className="h-5 w-5" /> Previous Detections
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(false)}>
                 <X className="h-4 w-4" />
              </Button>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {pastDetections.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No history found.</p>
                 </div>
              ) : (
                pastDetections.map((item) => (
                   <Card 
                     key={item.id} 
                     onClick={() => loadFromHistory(item)}
                     className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-transparent hover:border-l-primary"
                   >
                      <CardContent className="p-3">
                         <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm truncate">{item.diagnosis_name}</span>
                            <span className="text-xs font-mono bg-secondary px-1 rounded">{item.confidence}%</span>
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
           
           <div className="pt-4 border-t text-xs text-center text-muted-foreground">
              Showing last 10 records
           </div>
        </div>
      </div>

    </div>
  )
}