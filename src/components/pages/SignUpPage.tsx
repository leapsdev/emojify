import { DynamicFloatingEmojis } from "@/components/features/signup/FloatingEmojis"
import Header from "@/components/features/signup/Header"
import MainContent from "@/components/features/signup/MainContent"
import Footer from "@/components/features/signup/Footer"

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
