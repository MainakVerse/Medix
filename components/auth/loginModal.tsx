"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"
// If you don't have a Google Icon, use a generic one or text
import { Chrome } from "lucide-react" 

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      // Redirects to dashboard after login
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to Medix</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to access your personalized health dashboard and AI insights.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button 
            variant="outline" 
            className="w-full h-12 text-base gap-2 flex items-center justify-center border-gray-300" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Chrome className="h-5 w-5 text-red-500" />}
            Continue with Google
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}