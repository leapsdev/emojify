"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, UserPlus } from "lucide-react"
import { type User } from "@/components/features/chat/shared/types"

// モーダルのヘッダーコンポーネント
const ModalHeader = ({ onSkip }: { onSkip: () => void }) => {
  return (
    <>
      {/* ドラッグハンドル */}
      <div className="flex justify-center pt-4 pb-6">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
      </div>

      {/* ヘッダー部分 */}
      <div className="flex items-center justify-center relative px-4 pb-4">
        <div className="text-2xl absolute left-1/2 -translate-x-1/2">👦👧</div>
        <button onClick={onSkip} className="text-2xl absolute right-6" aria-label="Skip">
          👉
        </button>
      </div>
    </>
  )
}

// ユーザーアイテムコンポーネント
const UserItem = ({ user, selected, onSelect, onChatStart }: UserItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={user.avatar || "/placeholder.svg"} alt="" className="w-12 h-12 rounded-full" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base text-gray-900">{user.name}</span>
          <span className="text-sm text-gray-500">{user.username}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {selected ? (
          <button
            onClick={onChatStart}
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"
            aria-label="Chat with this user"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button
            onClick={onSelect}
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"
            aria-label="Add friend"
          >
            <UserPlus className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}

// ユーザーリストコンポーネント
const UserList = ({
  users,
  selectedUsers,
  onUserSelect,
  onChatStart,
}: {
  users: User[]
  selectedUsers: string[]
  onUserSelect: (userId: string) => void
  onChatStart: (userId: string) => void
}) => {
  return (
    <div className="px-4 overflow-y-auto flex-1">
      <div className="space-y-4 py-4">
        {users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            selected={selectedUsers.includes(user.id)}
            onSelect={() => onUserSelect(user.id)}
            onChatStart={() => onChatStart(user.id)}
          />
        ))}
      </div>
    </div>
  )
}

// メインのモーダルコンポーネント
interface SearchFriendsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserItemProps {
  user: User
  selected: boolean
  onSelect: () => void
  onChatStart: () => void
}

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
