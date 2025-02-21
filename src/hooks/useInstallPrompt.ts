"use client"

import { useState, useCallback } from "react"

let deferredPromptEvent: BeforeInstallPromptEvent | null = null

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", ((e: Event) => {
    e.preventDefault()
    deferredPromptEvent = e as BeforeInstallPromptEvent
  }) as EventListener)
}

export const useInstallPrompt = () => {
  const [showInstallModal, setShowInstallModal] = useState(false)

  const handleInstall = useCallback(async () => {
    if (deferredPromptEvent) {
      deferredPromptEvent.prompt()
      const { outcome } = await deferredPromptEvent.userChoice
      if (outcome === "accepted") {
        deferredPromptEvent = null
      }
    } else {
      setShowInstallModal(true)
    }
  }, [])

  return {
    showInstallModal,
    setShowInstallModal,
    handleInstall
  }
}
