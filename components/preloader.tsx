"use client"

import { useEffect, useState } from "react"

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-pulse-gradient">
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold text-primary-foreground">Medix</div>
        <div className="flex justify-center gap-2">
          <div className="h-3 w-3 bg-primary-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-primary-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-primary-foreground rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
