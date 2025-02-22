"use client"

import { FC } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic"

const EMOJIS = ["😊", "😎", "🌟", "🎉", "🚀", "🌈", "🍕", "🎸", "🏆", "🌺", "🦄", "🍦"]

const FloatingEmojis: FC = () => {
  const positions = EMOJIS.map(() => ({
    top: Math.random() * 80 + 10,
    left: Math.random() * 80 + 10,
    rotation: Math.random() * 30 - 15,
  }))

  return (
    <div className="absolute inset-0">
      {EMOJIS.map((emoji, index) => (
        <div
          key={index}
          className={`floating-element absolute text-4xl bg-gray-100 rounded-2xl p-4 shadow-md ${
            index % 2 === 0 ? "animate-float" : "animate-float-reverse"
          }`}
          style={{
            top: `${positions[index].top}%`,
            left: `${positions[index].left}%`,
            transform: `rotate(${positions[index].rotation}deg)`,
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  )
}

// dynamicインポートでクライアントサイドレンダリングのコンポーネントを作成
const DynamicFloatingEmojis = dynamic(
  () => Promise.resolve(FloatingEmojis),
  { ssr: false }
)

export default function SignUp() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* 浮遊する要素 */}
      <DynamicFloatingEmojis />

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        {/* ヘッダー */}
        <div className="flex justify-center mb-12 pt-8">
          <div className="text-7xl">🤪</div>
        </div>

        {/* 中央のテキスト */}
        <div className="flex-1 flex items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-black">
            <span className="text-gray-900">No Words,</span>
            <span className="creative-text text-yellow-400 mx-2">Just</span>
            <span className="text-gray-900">Emojis</span>
          </h1>
        </div>

        {/* フッター */}
        <div className="space-y-6">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-xl font-black">
            Get started
          </Button>

          <div className="flex justify-center items-center gap-4 text-gray-500">
            <Link href="#" className="hover:text-gray-600 font-bold">
              Help Center
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-600 font-bold">
              X
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-600 font-bold">
              Instagram
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-gray-600 font-bold">
              Farcaster
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

