import { DynamicFloatingEmojis } from "@/components/features/signup/floatingEmojis"
import Header from "@/components/features/signup/header"
import MainContent from "@/components/features/signup/mainContent"
import Footer from "@/components/features/signup/footer"

export const SignUpPage = () => {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <DynamicFloatingEmojis />

      <div className="relative z-10 flex flex-col min-h-screen p-6">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </main>
  )
}
