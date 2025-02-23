import { Header } from "@/components/features/create-profile/Header"
import { ProfileImage } from "@/components/features/create-profile/ProfileImage"
import { ProfileForm } from "@/components/features/create-profile/ProfileForm"
import { Footer } from "@/components/features/create-profile/Footer"

export function CreateProfilePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 p-4 space-y-8">
        <ProfileImage />
        <ProfileForm />
      </div>
      <Footer />
    </main>
  )
}
