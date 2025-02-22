'use client'

import { InstallModal } from "@/components/modal/installModal"
import { InstallContent } from "@/components/install/installContent"
import { InstallButton } from "@/components/install/installButton"
import { useInstallPrompt } from "@/components/pages/hooks/useInstallPrompt"

export const InstallPage = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } = useInstallPrompt()

  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallContent />
        <InstallButton onClick={handleInstall} />
      </div>

      <InstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
    </main>
  )
}
