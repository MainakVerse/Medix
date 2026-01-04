"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Apple, Activity, CheckCircle2, Circle, Plus, HeartPulse, Pill, Loader2, Dumbbell, Moon, Droplets } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// --- Types ---
interface CareProgram {
  id: number
  title: string
  start_date: string
  status: string
  progress: number
  data: any 
}

interface DetectionItem {
  id: number
  diagnosis_name: string
  created_at: string
  result_data: any
}

// --- Helper: Get Today's Date (YYYY-MM-DD) ---
const getTodayStr = () => new Date().toISOString().split('T')[0]

export default function CareProgramPage() {
  const [activePrograms, setActivePrograms] = useState<CareProgram[]>([])
  const [availableDetections, setAvailableDetections] = useState<DetectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Track specific task being updated to show spinner only on that item
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // 1. Fetch Data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [progRes, detRes] = await Promise.all([
          fetch("/api/care-programs"),
          fetch("/api/detections")
      ])
      const progData = await progRes.json()
      const detData = await detRes.json()
      
      if (Array.isArray(progData)) setActivePrograms(progData)
      if (Array.isArray(detData)) setAvailableDetections(detData)
    } catch (e) { console.error(e) } 
    finally { setLoading(false) }
  }

  // 2. Create Program Handler
  const handleCreateProgram = async (detection: DetectionItem) => {
    setIsCreating(true)
    try {
        const payload = {
            source_id: detection.id,
            title: detection.diagnosis_name,
            data: detection.result_data.diagnosis 
        }
        const res = await fetch("/api/care-programs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        if (res.ok) {
            fetchData() 
            setIsDialogOpen(false)
        } else if(res.status === 409) {
            alert("This program is already active!")
        }
    } catch (e) { console.error(e) } 
    finally { setIsCreating(false) }
  }

  // 3. TOGGLE TASK LOGIC (Check / Uncheck)
  const toggleTask = async (programId: number, taskName: string, currentStatus: boolean, totalTasksForProgram: number) => {
    const uniqueId = `${programId}-${taskName}`
    setUpdatingTaskId(uniqueId)

    // A. OPTIMISTIC UPDATE: Update UI immediately before server responds
    setActivePrograms(prev => prev.map(p => {
        if(p.id === programId) {
            // Deep copy data to modify logs safely
            const newData = JSON.parse(JSON.stringify(p.data))
            const today = getTodayStr()
            
            // Ensure logs structure exists
            if (!newData.logs) newData.logs = {}
            if (!newData.logs[today]) newData.logs[today] = { completed: [] }
            
            const completedList = newData.logs[today].completed
            
            if (currentStatus) {
                // Was Checked -> Now Uncheck (Remove from list)
                newData.logs[today].completed = completedList.filter((t: string) => t !== taskName)
            } else {
                // Was Unchecked -> Now Check (Add to list)
                if(!completedList.includes(taskName)) {
                    newData.logs[today].completed.push(taskName)
                }
            }
            
            return { ...p, data: newData }
        }
        return p
    }))

    try {
        // B. API CALL: Send new status to server to calculate progress
        const res = await fetch("/api/care-programs/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                program_id: programId,
                task_name: taskName,
                is_completed: !currentStatus, // Flip status
                total_tasks_count: totalTasksForProgram
            })
        })
        
        const json = await res.json()
        
        // C. SYNC PROGRESS: Update the progress bar with server value
        if (json.success) {
            setActivePrograms(prev => prev.map(p => 
                p.id === programId ? { ...p, progress: json.newProgress } : p
            ))
        }
    } catch (e) {
        console.error("Failed to update progress", e)
        fetchData() // Revert UI on error
    } finally {
        setUpdatingTaskId(null)
    }
  }

  // 4. Generate Task List for Display
  const generateTasksAndTotals = () => {
    const tasks: any[] = []
    
    activePrograms.forEach(prog => {
        const today = getTodayStr()
        const completedToday = prog.data.logs?.[today]?.completed || []
        
        // Collect all potential tasks for this program
        let programTasks: any[] = []

        // Medicines
        if (prog.data.medicines) {
            prog.data.medicines.forEach((med: any) => {
                programTasks.push({ name: `Take ${med.composition}`, icon: Pill })
            })
        }
        // Suggestions (Limit 2)
        if (prog.data.medical_suggestions) {
            prog.data.medical_suggestions.slice(0, 2).forEach((sug: string) => {
                programTasks.push({ name: sug, icon: Activity })
            })
        }
        // Hydration
        programTasks.push({ name: "Daily Hydration Goal", icon: Droplets })

        // Add to flat list
        programTasks.forEach(t => {
            tasks.push({
                programId: prog.id,
                programTitle: prog.title,
                task: t.name,
                icon: t.icon,
                completed: completedToday.includes(t.name), // Check if logged
                totalTasksForProgram: programTasks.length
            })
        })
    })
    return tasks
  }

  const tasks = generateTasksAndTotals()

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground text-balance">Care Program</h1>
            <p className="text-lg text-muted-foreground text-pretty">Your personalized health and wellness guidance</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="gap-2"><Plus className="h-5 w-5" /> Start New Program</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Select a Diagnosis</DialogTitle>
                    <DialogDescription>Choose a recent AI detection to track.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2 max-h-[300px] overflow-y-auto">
                    {availableDetections.length === 0 ? <p className="text-sm text-center py-4">No recent detections.</p> :
                    availableDetections.map((det) => (
                        <div key={det.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                            <div>
                                <p className="font-semibold">{det.diagnosis_name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(det.created_at).toLocaleDateString()}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleCreateProgram(det)} disabled={isCreating}>
                                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
          </Dialog>
      </div>

      {/* ACTIVE PROGRAMS */}
      {activePrograms.length === 0 ? (
         <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
            <HeartPulse className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">No Active Programs</h3>
            <p className="text-muted-foreground">Start a new program to track your health goals.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePrograms.map((prog) => (
            <Card key={prog.id} className="border-2 animate-in slide-in-from-bottom-2">
                <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg"><Activity className="h-5 w-5 text-primary" /></div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                        {prog.status}
                    </span>
                </div>
                <CardTitle>{prog.title}</CardTitle>
                <CardDescription>Started: {new Date(prog.start_date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recovery Progress</span>
                        <span className="font-semibold text-foreground">{prog.progress}%</span>
                    </div>
                    {/* The Progress Bar updates when 'prog.progress' changes in state */}
                    <Progress value={prog.progress} className="h-2 transition-all duration-700 ease-in-out" />
                </div>
                <div className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                    Completing daily tasks increases your overall program score.
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
      )}

      {/* INTERACTIVE TASK LIST */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Today&apos;s Tasks</CardTitle>
          <CardDescription>Click to complete and update progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.length === 0 ? (
                 <p className="text-sm text-muted-foreground italic">No tasks for today.</p>
            ) : (
                tasks.map((item, index) => {
                const Icon = item.icon
                const isUpdating = updatingTaskId === `${item.programId}-${item.task}`
                
                return (
                    <div
                    key={index}
                    // Toggle function called here on click
                    onClick={() => !isUpdating && toggleTask(item.programId, item.task, item.completed, item.totalTasksForProgram)}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer select-none group ${
                        item.completed ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-secondary/20 border-border hover:border-primary/50"
                    }`}
                    >
                    {/* Icon Logic: Spinner, Check, or Empty Circle */}
                    {isUpdating ? (
                        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin flex-shrink-0" />
                    ) : item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                    )}
                    
                    <Icon className={`h-5 w-5 flex-shrink-0 ${item.completed ? "text-green-600" : "text-muted-foreground"}`} />
                    
                    <div className="flex-1">
                        <span className={`block font-medium ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {item.task}
                        </span>
                        <span className="text-xs text-primary">{item.programTitle}</span>
                    </div>
                    </div>
                )
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* GUIDELINES */}
      {activePrograms.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Active Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePrograms.map((prog) => (
                    prog.data.guidelines && (
                        <Card key={`guide-${prog.id}`} className="border-2">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Apple className="h-5 w-5 text-primary" /></div>
                                    <CardTitle className="text-lg">{prog.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-green-600 mb-2">Recommended</h4>
                                        <ul className="space-y-1">
                                            {prog.data.guidelines.dos?.slice(0, 3).map((item: string, i: number) => (
                                                <li key={i} className="text-xs text-muted-foreground border-l-2 border-green-200 pl-2 py-0.5">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-red-600 mb-2">Avoid</h4>
                                        <ul className="space-y-1">
                                            {prog.data.guidelines.donts?.slice(0, 3).map((item: string, i: number) => (
                                                <li key={i} className="text-xs text-muted-foreground border-l-2 border-red-200 pl-2 py-0.5">{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                ))}
            </div>
          </div>
      )}
    </div>
  )
}