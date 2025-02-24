'use client'

import { InstallButton } from "@/components/features/install/installButton"
import { InstallModal } from "@/components/features/install/installModal"
import { useInstallPrompt } from "@/components/pages/hooks/useInstallPrompt"
import { LoginButton } from "@/components/features/auth/loginSignUpButton"

export const InstallSection = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } = useInstallPrompt()

  return (
    <div className="flex flex-col items-center gap-4">
      <InstallButton onClick={handleInstall} />
      <LoginButton />
      <InstallModal open={showInstallModal} onOpenChange={setShowInstallModal} />
    </div>
  )
}
