import { use } from "react"
import { ChatRoomPage } from "@/components/pages/chatRoomPage"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <ChatRoomPage username={resolvedParams.id} />
}
