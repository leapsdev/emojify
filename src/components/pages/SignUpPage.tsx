import { DynamicFloatingEmojis } from "@/components/signup/FloatingEmojis"
import Header from "@/components/signup/Header"
import MainContent from "@/components/signup/MainContent"
import Footer from "@/components/signup/Footer"

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
