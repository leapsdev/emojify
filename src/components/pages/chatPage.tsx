"use client"

import { Header } from "@/components/features/chat/header"
import { MessageList } from "@/components/features/chat/messageList"
import { NewMessageButton } from "@/components/features/chat/newMessageButton"
import { FooterNavigation } from "@/components/features/chat/footerNavigation"
import { INITIAL_MESSAGES } from "@/components/features/chat/constants"
import { WalletModal } from "@/components/features/chat/walletModal"
import { useState } from "react"

export const ChatPage = () => {
  const [showWalletModal, setShowWalletModal] = useState(true)

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <MessageList messages={INITIAL_MESSAGES} />
      <NewMessageButton />
      <FooterNavigation />
      <WalletModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </main>
  )
}
