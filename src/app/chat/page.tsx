"use client"
import Link from "next/link"
import Image from "next/image"
// import { SearchFriendsModal } from "@/components/search-friends-modal"

const messages = [
  {
    id: "Jossh",
    username: "Jossh",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "You: Hello!",
    time: "1 hours ago",
    online: true,
  },
  {
    id: "Jacob",
    username: "Jacob",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "You: Hello!",
    time: "1 hours ago",
    online: true,
  },
]

export default function ChatPage() {
  // const [showSearchModal, setShowSearchModal] = useState(false)

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b flex items-center justify-center">
        <span className="text-2xl">💬</span>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y">
          {messages.map((message) => (
            <Link key={message.id} href={`/chat/${message.id}`} className="block">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <Image 
                    src={message.avatar || "/placeholder.svg"} 
                    alt="User avatar" 
                    width={48} 
                    height={48} 
                    className="rounded-full"
                  />
                  {message.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{message.username}</h3>
                    <span className="text-sm text-gray-500">{message.time}</span>
                  </div>
                  <p className="text-gray-500 truncate">{message.message}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 新規メッセージ作成ボタン */}
      <Link
        href="/choose-friends"
        className="fixed right-4 bottom-20 bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
      >
        <span className="text-2xl">💬</span>
      </Link>

      {/* フッターナビゲーション */}
      <div className="border-t py-3 px-6">
        <div className="flex justify-between items-center">
          <Link href="/chat" className="text-blue-600">
            <span className="text-2xl">💬</span>
          </Link>
          <Link href="/search" className="text-gray-400">
            <span className="text-2xl">🔍</span>
          </Link>
          <Link href="/new" className="text-gray-400">
            <span className="text-2xl">🤪</span>
          </Link>
          <Link href="/notifications" className="text-gray-400">
            <span className="text-2xl">🔔</span>
          </Link>
          <Link href="/profile" className="text-gray-400">
            <span className="text-2xl">🙎‍♂️</span>
          </Link>
        </div>
      </div>

      {/* 友達検索モーダル */}
      {/* <SearchFriendsModal open={showSearchModal} onOpenChange={setShowSearchModal} /> */}
    </main>
  )
}
