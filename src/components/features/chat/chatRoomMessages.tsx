import { ChatMessage } from "./types"

type ChatRoomMessagesProps = {
  messages: ChatMessage[]
}

export const ChatRoomMessages = ({ messages }: ChatRoomMessagesProps) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {/* 日付セパレーター */}
      <div className="text-center">
        <span className="text-sm text-gray-400">Today</span>
      </div>

      {/* メッセージ */}
      {messages.map((msg) => (
        <div key={msg.id} className="flex flex-col items-end gap-1">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-[22px] text-lg">{msg.content}</div>
          <div className="flex items-center gap-1 text-xs text-gray-400 pr-1">
            <span>{msg.timestamp}</span>
            {msg.sent && <span>Sent</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
