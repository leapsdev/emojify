"use client"

import Image from "next/image"
import { MessageCircle, UserPlus } from "lucide-react"
import { type User } from "@/components/features/chat/shared/types"

interface UserItemProps {
  user: User
  selected: boolean
  onSelect: () => void
  onChatStart: () => void
}

export function UserItem({ user, selected, onSelect, onChatStart }: UserItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <Image
            src={user.avatar || "/placeholder.svg"}
            alt={`${user.name}のアバター`}
            fill
            className="rounded-full object-cover"
          />
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
