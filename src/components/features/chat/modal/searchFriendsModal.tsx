"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { type User } from "@/components/features/chat/shared/types"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { UserList } from "./components/userList"

const SUGGESTED_USERS: User[] = [
  {
    id: "1",
    name: "Kinjo",
    username: "illshin",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "2",
    name: "yamapyblack",
    username: "yamapyblack",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "3",
    name: "Ritulya",
    username: "babushka",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "4",
    name: "toto 🎭🐷💜🧀💧🍭💛",
    username: "totomal",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "5",
    name: "tantan777 🎭",
    username: "tantan777",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "6",
    name: "Yuki Sato",
    username: "yukisato.eth",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "7",
    name: "DENJIN-K",
    username: "denjin",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "8",
    name: "passion 😎",
    username: "hyde2000",
    avatar: "/placeholder.svg?height=48&width=48",
  },
  {
    id: "9",
    name: "0xTouYan",
    username: "0xtouyan.eth",
    avatar: "/placeholder.svg?height=48&width=48",
  },
]

interface SearchFriendsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchFriendsModal({ open, onOpenChange }: SearchFriendsModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const router = useRouter()

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleChatStart = (userId: string) => {
    router.push(`/chat/${userId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 rounded-[32px] max-w-full sm:max-w-lg mx-auto bg-white">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <DialogTitle className="text-lg font-semibold">
            Search Friends
          </DialogTitle>
          <button
            type="button"
            className="text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* アイコン */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">👥</div>
        </div>

        {/* ユーザーリスト */}
        <div className="max-h-[60vh] overflow-y-auto">
          <UserList
            users={SUGGESTED_USERS}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onChatStart={handleChatStart}
          />
        </div>

        {/* フッター */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            Let&apos;s find new friends!
            <span className="text-4xl">🤝</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
