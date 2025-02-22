"use client"

import { FC } from "react"
import { DynamicFloatingEmojis } from "@/components/signup/FloatingEmojis"
import Header from "@/components/signup/Header"
import MainContent from "@/components/signup/MainContent"
import Footer from "@/components/signup/Footer"

const SignUpPage: FC = () => {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* 浮遊する要素 */}
      <DynamicFloatingEmojis />

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </main>
  )
}

export default SignUpPage
