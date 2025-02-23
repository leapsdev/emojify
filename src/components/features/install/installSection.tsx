'use client'

import { InstallButton } from "@/components/features/install/installButton"
import { InstallModal } from "@/components/modal/installModal"
import { useInstallPrompt } from "@/components/pages/hooks/useInstallPrompt"

export const InstallSection = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } = useInstallPrompt()

  return (
    <>
      <InstallButton onClick={handleInstall} />
      <InstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
    </>
  )
} 