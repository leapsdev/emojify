export type Message = {
  id: string
  username: string
  avatar: string
  message: string
  time: string
  online: boolean
}

export type ChatMessage = {
  id: string
  content: string
  timestamp: string
  sent: boolean
}
