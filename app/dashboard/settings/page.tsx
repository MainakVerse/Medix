"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, HeartPulse, Activity, Save, Loader2, ShieldAlert, FileText } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    // Profile Fields (Matches your screenshot)
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    
    // Medical Fields
    age: "",
    blood_type: "",
    height: "",
    weight: "",
    allergies: "",
    medical_conditions: "",
    emergency_contact: "",
    
    // Preferences
    language: "English",
    notifications_enabled: true
  })

  // 1. Fetch Data on Mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        // Map API response to State
        if (data.id) {
            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                email: data.email || "",
                phone: data.phone || "",
                age: data.age || "",
                blood_type: data.blood_type || "",
                height: data.height || "",
                weight: data.weight || "",
                allergies: data.allergies || "",
                medical_conditions: data.medical_conditions || "",
                emergency_contact: data.emergency_contact || "",
                language: data.language || "English",
                notifications_enabled: data.notifications_enabled ?? true
            })
        }
      }
    } catch (error) {
      console.error("Failed to load settings", error)
    } finally {
      setLoading(false)
    }
  }

  // 2. Save Handler
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        alert("Settings saved successfully!")
        // Update Sidebar Name immediately
        window.dispatchEvent(new Event("profile-updated"))
      } else {
        alert("Failed to save settings.")
      }
    } catch (error) {
      console.error(error)
      alert("Error saving settings.")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and app preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="medical">Medical Data</TabsTrigger>
          <TabsTrigger value="preferences">App Preferences</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PROFILE (Matches Screenshot) --- */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <User className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    value={formData.first_name} 
                    onChange={(e) => handleChange("first_name", e.target.value)} 
                    placeholder="e.g. John"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    value={formData.last_name} 
                    onChange={(e) => handleChange("last_name", e.target.value)} 
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => handleChange("email", e.target.value)} 
                  placeholder="john.doe@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => handleChange("phone", e.target.value)} 
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[140px]">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: MEDICAL --- */}
        <TabsContent value="medical" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle>Medical Profile</CardTitle>
                    <CardDescription>Used for AI diagnosis accuracy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" value={formData.age} onChange={(e) => handleChange("age", e.target.value)} placeholder="30" />
                 </div>
                 <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select value={formData.blood_type} onValueChange={(val) => handleChange("blood_type", val)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Height</Label>
                    <Input value={formData.height} onChange={(e) => handleChange("height", e.target.value)} placeholder="175 cm" />
                 </div>
                 <div className="space-y-2">
                    <Label>Weight</Label>
                    <Input value={formData.weight} onChange={(e) => handleChange("weight", e.target.value)} placeholder="70 kg" />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-500" /> Allergies</Label>
                 <Textarea value={formData.allergies} onChange={(e) => handleChange("allergies", e.target.value)} placeholder="e.g. Peanuts, Penicillin" />
              </div>

              <div className="space-y-2">
                 <Label className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Medical Conditions</Label>
                 <Textarea value={formData.medical_conditions} onChange={(e) => handleChange("medical_conditions", e.target.value)} placeholder="e.g. Asthma, Diabetes" />
              </div>

              <div className="pt-2">
                <Button onClick={handleSave} disabled={saving}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: PREFERENCES --- */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
           <Card>
              <CardHeader>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg"><Activity className="h-5 w-5" /></div>
                    <CardTitle>App Preferences</CardTitle>
                 </div>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-0.5">
                       <Label className="text-base">Email Notifications</Label>
                       <p className="text-sm text-muted-foreground">Receive updates about your care program.</p>
                    </div>
                    <Switch checked={formData.notifications_enabled} onCheckedChange={(val) => handleChange("notifications_enabled", val)} />
                 </div>
                 <div className="space-y-2 max-w-md">
                    <Label>Language</Label>
                    <Select value={formData.language} onValueChange={(val) => handleChange("language", val)}>
                        <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="pt-2">
                    <Button onClick={handleSave} disabled={saving}>Save Changes</Button>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}