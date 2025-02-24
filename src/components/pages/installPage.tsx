import { InstallContent } from "@/components/features/install/installContent"
import { InstallSection } from "@/components/features/install/installSection"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"

export const InstallPage = () => {
  const { login, ready, authenticated } = usePrivy()

  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallContent />
        <InstallSection />
        {ready && !authenticated && (
          <Button
            onClick={login}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            ログイン
          </Button>
        )}
      </div>
    </main>
  )
}
