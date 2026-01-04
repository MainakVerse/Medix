"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, AlertCircle, PlusCircle, UploadCloud, Stethoscope, Image as ImageIcon, Trash2, CheckCircle2, FileJson, Calendar, User, AlignLeft } from "lucide-react"
import Link from "next/link"

export default function PrescriptionPage() {
  const [activeTab, setActiveTab] = useState("fetched")
  
  // State for AI Data (Draft)
  const [pendingData, setPendingData] = useState<any>(null)
  
  // Form State
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: "",
    medicalHistory: "",
  })

  // State for Database Records
  const [savedDigitalRx, setSavedDigitalRx] = useState<any[]>([]) 
  const [uploadedRx, setUploadedRx] = useState<any[]>([])       
  
  // Modal State
  const [selectedRx, setSelectedRx] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 1. Load Pending Draft on Mount
  useEffect(() => {
    const data = localStorage.getItem("pending_prescription")
    if (data) {
      const parsed = JSON.parse(data)
      setPendingData(parsed)
      setPatientInfo(prev => ({
        ...prev,
        medicalHistory: `Diagnosis: ${parsed.diagnosisName}\nDate: ${new Date(parsed.timestamp).toLocaleDateString()}`
      }))
    }
  }, [])

  // 2. Fetch Stored Records when Tab Changes
  useEffect(() => {
    if (activeTab === "uploads") {
      fetchUploadedRx()
      fetchDigitalRx()
    }
  }, [activeTab])

  const fetchUploadedRx = async () => {
    try {
      const res = await fetch("/api/prescriptions")
      const data = await res.json()
      if (Array.isArray(data)) setUploadedRx(data)
    } catch (e) { console.error(e) }
  }

  const fetchDigitalRx = async () => {
    try {
      const res = await fetch("/api/saved-prescriptions")
      const data = await res.json()
      if (Array.isArray(data)) setSavedDigitalRx(data)
    } catch (e) { console.error(e) }
  }

  // --- SAVE AI DRAFT TO DATABASE ---
  const handleSaveDigitalRx = async () => {
    if (!patientInfo.name || !pendingData) return;
    setIsSaving(true);

    try {
        const payload = {
            patient_name: patientInfo.name,
            age: patientInfo.age,
            diagnosis: pendingData.diagnosisName,
            symptoms: pendingData.symptoms,
            medicines: pendingData.medicines, 
            doctor_notes: patientInfo.medicalHistory
        };

        const res = await fetch("/api/saved-prescriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Prescription saved to digital records!");
            localStorage.removeItem("pending_prescription");
            setPendingData(null);
            setPatientInfo({ name: "", age: "", medicalHistory: "" });
            setActiveTab("uploads");
        }
    } catch (error) {
        console.error("Save failed", error);
        alert("Failed to save prescription.");
    } finally {
        setIsSaving(false);
    }
  }

  // --- UPLOAD IMAGE TO DATABASE ---
  const handleUpload = async () => {
    if (!uploadFile || !patientInfo.name) {
        alert("Please provide patient name and select a file.")
        return
    }
    setIsUploading(true)
    const reader = new FileReader();
    reader.readAsDataURL(uploadFile);
    reader.onloadend = async () => {
        const base64data = reader.result;
        try {
            await fetch("/api/prescriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_name: patientInfo.name,
                    image_url: base64data,
                    doctor_notes: patientInfo.medicalHistory
                })
            })
            setUploadFile(null)
            fetchUploadedRx()
            setPatientInfo(prev => ({...prev, name: ""})) 
        } catch (error) { console.error(error) } finally { setIsUploading(false) }
    }
  }

  const handleClearDraft = () => {
    if(confirm("Discard this draft?")) {
        localStorage.removeItem("pending_prescription")
        setPendingData(null)
        setPatientInfo({ name: "", age: "", medicalHistory: "" })
    }
  }

  // --- OPEN MODAL HANDLER ---
  const handleOpenDetails = (rx: any) => {
      setSelectedRx(rx)
      setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground text-balance">Prescription Manager</h1>
        <p className="text-lg text-muted-foreground text-pretty">Manage AI-generated drafts and patient records</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fetched">AI Prescription (Drafts)</TabsTrigger>
          <TabsTrigger value="uploads">Stored Records (Database)</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: AI FETCHED PRESCRIPTION --- */}
        <TabsContent value="fetched" className="space-y-6 mt-6">
            <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-800 font-medium">Drafts must be reviewed by a licensed physician.</p>
                </CardContent>
            </Card>

            {!pendingData && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20 animate-in fade-in zoom-in-95">
                    <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                        <Stethoscope className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Pending Draft</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Run a symptom analysis to generate a new prescription draft.
                    </p>
                    <Button size="lg" asChild className="gap-2">
                        <Link href="/dashboard/detection">
                            <PlusCircle className="h-5 w-5" /> Start Disease Detection
                        </Link>
                    </Button>
                </div>
            )}

            {pendingData && (
                <Card className="border-2 border-primary shadow-lg animate-in slide-in-from-bottom-4">
                    <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle>Rx Draft: {pendingData.diagnosisName}</CardTitle>
                                <CardDescription>Generated via AI Analysis</CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleClearDraft} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Discard
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Disease Name</Label>
                                <Input placeholder="Enter Name" value={patientInfo.name} onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Age</Label>
                                <Input type="number" placeholder="Age" value={patientInfo.age} onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input value={new Date().toLocaleDateString()} disabled />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-secondary/30 rounded-lg border">
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">Presenting Symptoms</h4>
                                    <p className="text-foreground text-sm leading-relaxed">{pendingData.symptoms}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Doctor's Notes</Label>
                                    <Textarea value={patientInfo.medicalHistory} onChange={(e) => setPatientInfo({...patientInfo, medicalHistory: e.target.value})} className="min-h-[100px]" />
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-secondary px-4 py-2 font-semibold text-sm flex items-center gap-2 border-b">
                                    <FileText className="h-4 w-4" /> Prescribed Medications
                                </div>
                                <div className="divide-y">
                                    {pendingData.medicines && pendingData.medicines.map((med: any, i: number) => (
                                        <div key={i} className="p-4 hover:bg-muted/20">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-primary">{med.composition}</span>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{med.brands?.[0] || "Generic"}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{med.dosage_instruction}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                             <Button onClick={handleSaveDigitalRx} disabled={!patientInfo.name || isSaving} className="w-full md:w-auto">
                                {isSaving ? "Saving to Database..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Finalize & Save Record</>}
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </TabsContent>

        {/* --- TAB 2: STORED RECORDS --- */}
        <TabsContent value="uploads" className="space-y-8 mt-6">
            
            {/* SECTION A: DIGITAL PRESCRIPTIONS */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-blue-600" /> Digital Records
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {savedDigitalRx.length === 0 ? (
                         <p className="text-muted-foreground text-sm italic">No digital prescriptions saved yet.</p>
                    ) : (
                        savedDigitalRx.map((rx) => (
                            <Card 
                                key={rx.id} 
                                className="hover:border-primary transition-all cursor-pointer hover:shadow-md group"
                                onClick={() => handleOpenDetails(rx)}
                            >
                                <CardHeader className="bg-secondary/20 pb-2">
                                    <div className="flex justify-between">
                                        <div>
                                            <CardTitle className="text-base group-hover:text-primary transition-colors">{rx.patient_name}</CardTitle>
                                            <CardDescription>Age: {rx.age || 'N/A'}</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-primary">{rx.diagnosis}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(rx.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 text-sm space-y-3">
                                    <div className="bg-muted/30 p-2 rounded">
                                        <span className="font-semibold text-xs uppercase text-muted-foreground">Medicines:</span>
                                        <ul className="list-disc list-inside mt-1">
                                            {rx.medicines && Array.isArray(rx.medicines) && rx.medicines.slice(0, 3).map((m: any, idx: number) => (
                                                <li key={idx} className="truncate">{m.composition}</li>
                                            ))}
                                            {rx.medicines && rx.medicines.length > 3 && <li>...and more</li>}
                                        </ul>
                                    </div>
                                    {rx.doctor_notes && (
                                        <p className="text-muted-foreground border-l-2 pl-2 italic truncate">{rx.doctor_notes}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* SECTION B: UPLOADED SCANS */}
            <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-orange-600" /> Uploaded Scans
                    </h2>
                </div>

                {/* Upload Form */}
                <Card className="bg-secondary/10 border-dashed border-2">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1">
                                <Label>Upload New Scan</Label>
                                <div className="flex gap-2">
                                    <Input placeholder="Patient Name" value={patientInfo.name} onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})} className="w-1/3" />
                                    <Input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="flex-1" />
                                </div>
                            </div>
                            <Button onClick={handleUpload} disabled={isUploading} variant="secondary">
                                {isUploading ? "Uploading..." : <UploadCloud className="h-4 w-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedRx.length === 0 ? (
                        <p className="col-span-full text-center text-muted-foreground py-4 text-sm italic">No scanned documents uploaded.</p>
                    ) : (
                        uploadedRx.map((rx) => (
                            <Card 
                                key={rx.id} 
                                className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                onClick={() => handleOpenDetails(rx)}
                            >
                                <div className="aspect-square relative bg-black/5 flex items-center justify-center overflow-hidden">
                                    {rx.image_url ? (
                                        <img src={rx.image_url} alt="Rx" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="font-medium text-sm truncate">{rx.patient_name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(rx.uploaded_at).toLocaleDateString()}</p>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </TabsContent>
      </Tabs>

      {/* --- DETAIL MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                    {selectedRx?.diagnosis ? <FileText className="text-blue-500"/> : <ImageIcon className="text-orange-500"/>}
                    Prescription Details
                </DialogTitle>
                <DialogDescription>
                    Record ID: {selectedRx?.id} • Created: {selectedRx ? new Date(selectedRx.created_at || selectedRx.uploaded_at).toLocaleDateString() : ""}
                </DialogDescription>
            </DialogHeader>

            {selectedRx && (
                <div className="space-y-6 mt-4">
                    {/* Common Header Info */}
                    <div className="grid grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-lg">
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase">Patient Name</Label>
                            <p className="font-semibold text-lg flex items-center gap-2">
                                <User className="h-4 w-4" /> {selectedRx.patient_name}
                            </p>
                        </div>
                        {selectedRx.age && (
                            <div>
                                <Label className="text-xs text-muted-foreground uppercase">Age</Label>
                                <p className="font-medium">{selectedRx.age} Years</p>
                            </div>
                        )}
                        {selectedRx.diagnosis && (
                            <div className="col-span-2 border-t pt-2 mt-2">
                                <Label className="text-xs text-muted-foreground uppercase">Diagnosis</Label>
                                <p className="font-bold text-primary text-lg">{selectedRx.diagnosis}</p>
                            </div>
                        )}
                    </div>

                    {/* CONTENT FOR DIGITAL PRESCRIPTION */}
                    {selectedRx.diagnosis ? (
                        <>
                            {selectedRx.symptoms && (
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><AlignLeft className="h-4 w-4"/> Symptoms</h4>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{selectedRx.symptoms}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><FileText className="h-4 w-4"/> Medications</h4>
                                <div className="border rounded-md divide-y">
                                    {selectedRx.medicines && Array.isArray(selectedRx.medicines) ? (
                                        selectedRx.medicines.map((med: any, i: number) => (
                                            <div key={i} className="p-3 text-sm">
                                                <div className="font-bold">{med.composition}</div>
                                                <div className="text-muted-foreground">{med.dosage_instruction}</div>
                                                <div className="text-xs text-blue-600 mt-1">Brands: {med.brands?.join(", ")}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-3 text-sm text-muted-foreground">No medicines listed.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        // CONTENT FOR UPLOADED IMAGE
                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Scanned Document</h4>
                            <div className="border rounded-lg overflow-hidden bg-black/5">
                                {selectedRx.image_url && (
                                    <img src={selectedRx.image_url} alt="Prescription Scan" className="w-full h-auto" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Doctor Notes (Common) */}
                    {selectedRx.doctor_notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" /> Doctor's Notes
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 italic">
                                {selectedRx.doctor_notes}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>

    </div>
  )
}