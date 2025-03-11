"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type User } from "@/components/features/chat/shared/types"
import { ModalHeader } from "./components/modalHeader"
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

  const handleSkip = () => {
    onOpenChange(false)
    router.push("/chat")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => onOpenChange(false)}>
      <div
        className="w-full max-w-md bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col max-h-[90vh]">
          <ModalHeader onSkip={handleSkip} />
          <UserList
            users={SUGGESTED_USERS}
            selectedUsers={selectedUsers}
            onUserSelect={handleUserSelect}
            onChatStart={handleChatStart}
          />
        </div>
      </div>
    </div>
  )
}
