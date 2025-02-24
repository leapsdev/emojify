import { InstallContent } from "@/components/features/install/installContent"
import { InstallSection } from "@/components/features/install/installSection"
import { LoginButton } from "@/components/features/auth/loginButton"

export const InstallPage = () => {
  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallContent />
        <InstallSection />
        <LoginButton />
      </div>
    </main>
  )
}
