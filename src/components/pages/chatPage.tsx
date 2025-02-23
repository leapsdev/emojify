"use client"

import { Header } from "@/components/features/chat/header"
import { MessageList } from "@/components/features/chat/messageList"
import { NewMessageButton } from "@/components/features/chat/newMessageButton"
import { FooterNavigation } from "@/components/features/chat/footerNavigation"
import { INITIAL_MESSAGES } from "@/components/features/chat/constants"

export const ChatPage = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <MessageList messages={INITIAL_MESSAGES} />
      <NewMessageButton />
      <FooterNavigation />
    </main>
  )
}
