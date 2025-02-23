import { Header } from "@/components/create-profile/Header"
import { ProfileImage } from "@/components/create-profile/ProfileImage"
import { ProfileForm } from "@/components/create-profile/ProfileForm"
import { Footer } from "@/components/create-profile/Footer"

export default function CreateProfile() {
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
