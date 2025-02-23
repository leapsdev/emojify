import { InstallContent } from "@/components/install/installContent"
import { InstallSection } from "@/components/install/installSection"

export const InstallPage = () => {
  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallContent />
        <InstallSection />
      </div>
    </main>
  )
}
