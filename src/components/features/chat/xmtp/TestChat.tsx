'use client';

import { useState } from 'react';
import { useMessages } from './hooks/useMessages';
import { usePrivy } from '@privy-io/react-auth';

export function TestChat() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const { ready, authenticated, login } = usePrivy();
  const { messages, loading, error, sendMessage } = useMessages(recipientAddress);

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログインしてチャットを開始
        </button>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !recipientAddress.trim()) return;

    try {
      await sendMessage(messageContent);
      setMessageContent('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="宛先のウォレットアドレス"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 rounded p-4 mb-4">
        {loading ? (
          <div className="text-center">Loading messages...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">メッセージはありません</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded max-w-[80%] ${
                  msg.sent
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-gray-200 text-black'
                }`}
              >
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs opacity-75">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={!messageContent.trim() || !recipientAddress.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          送信
        </button>
      </form>
    </div>
  );
}
