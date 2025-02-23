import Image from "next/image"

interface User {
  id: string
  displayName: string
  userId: string
  avatar: string
  section: "recent" | "favorites" | "friends"
}

interface UserItemProps {
  user: User
  selected: boolean
  onSelect: () => void
}

export function UserItem({ user, selected, onSelect }: UserItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image 
          src={user.avatar || "/placeholder.svg"}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-base">{user.displayName}</span>
          <span className="text-sm text-gray-500">{user.userId}</span>
        </div>
      </div>
      <div
        role="checkbox"
        aria-checked={selected}
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
        className={`w-6 h-6 rounded-full border-2 ${selected ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
      />
    </div>
  )
}
