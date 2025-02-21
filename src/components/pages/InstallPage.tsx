"use client"

import { InstallModal } from "@/components/modal/installModal"
import { InstallHeader } from "@/components/install/InstallHeader"
import { InstallButton } from "@/components/install/InstallButton"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"

export const InstallPage = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } = useInstallPrompt()

  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="floating-elements absolute inset-0">{/* 既存の絵文字の配置コード... */}</div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallHeader />
        <InstallButton onClick={handleInstall} />
      </div>

      <InstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
    </main>
  )
}
