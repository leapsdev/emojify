"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { type User } from "@/components/features/chat/shared/types"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
      <DialogContent className="!rounded-[24px] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] p-0 w-[min(90vw,32rem)] bg-white">
        <DialogClose className="absolute right-4 top-4 rounded-full hover:bg-gray-100 p-2 transition-colors">
          <X className="w-4 h-4" />
        </DialogClose>
        
        <div className="p-6 space-y-6">
          {/* ドラッグハンドル */}
          <div className="flex justify-center">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
          </div>

          {/* ヘッダー部分 */}
          <div className="text-center space-y-1">
            <DialogTitle className="text-xl font-black">
              Search Friends
            </DialogTitle>
            <div className="text-2xl">👦👧</div>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
