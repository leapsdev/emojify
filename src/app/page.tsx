"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { InstallModal } from "@/components/modal/installModal"



export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallModal, setShowInstallModal] = useState(false)

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", ((e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }) as EventListener)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }
    } else {
      setShowInstallModal(true)
    }
  }

  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="floating-elements absolute inset-0">{/* 既存の絵文字の配置コード... */}</div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-8 text-6xl">🤪</div>

        <h1 className="text-4xl font-black mb-2 tracking-tight">Get the Emoji Chat app</h1>
        <p className="text-gray-700 mb-8 text-xl font-bold">
          Never miss a post again. Install the app for the best experience.
        </p>

        <Button
          onClick={handleInstall}
          className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
        >
          <Download className="mr-2 h-5 w-5" />
          Install app
        </Button>
      </div>

      <InstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
    </main>
  )
}
