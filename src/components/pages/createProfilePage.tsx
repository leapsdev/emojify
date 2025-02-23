import { Header } from "@/components/features/create-profile/header"
import { ProfileImage } from "@/components/features/create-profile/profileImage"
import { ProfileForm } from "@/components/features/create-profile/profileForm"
import { Footer } from "@/components/features/create-profile/footer"

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
