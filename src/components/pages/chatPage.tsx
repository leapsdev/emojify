"use client"

import { useState } from "react"
import { Header } from "@/components/features/chat/header"
import { MessageList } from "@/components/features/chat/messageList"
import { NewMessageButton } from "@/components/features/chat/newMessageButton"
import { FooterNavigation } from "@/components/features/chat/footerNavigation"
import { INITIAL_MESSAGES } from "@/components/features/chat/constants"
import { SearchFriendsModal } from "@/components/features/chat/searchFriendsModal"

export const ChatPage = () => {
  const [showSearchModal, setShowSearchModal] = useState(false)
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <MessageList messages={INITIAL_MESSAGES} />
      <NewMessageButton />
      <FooterNavigation />
      <SearchFriendsModal open={showSearchModal} onOpenChange={setShowSearchModal} /> 
    </main>
  )
}
