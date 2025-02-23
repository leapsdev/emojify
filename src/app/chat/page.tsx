"use client"
import { Header } from "@/components/features/chat/Header"
import { MessageList } from "@/components/features/chat/MessageList"
import { NewMessageButton } from "@/components/features/chat/NewMessageButton"
import { FooterNavigation } from "@/components/features/chat/FooterNavigation"
import { INITIAL_MESSAGES } from "@/components/features/chat/constants"

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <MessageList messages={INITIAL_MESSAGES} />
      <NewMessageButton />
      <FooterNavigation />
    </main>
  )
}
