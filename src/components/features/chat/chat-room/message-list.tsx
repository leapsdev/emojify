'use client';

import { formatDateToYYYYMMDD } from '@/utils/date';
import type { Message } from '@/types/database';
import { useEffect, useState } from 'react';
import { subscribeToRoomMessages } from './client-action';

type MessageListProps = {
  roomId: string;
  currentUserId: string;
};

export function MessageList({ roomId, currentUserId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoomMessages(roomId, setMessages);

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  if (!messages.length) {
    return (
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <p className="text-gray-500">メッセージがありません</p>
      </div>
    );
  }

  // 日付でメッセージをグループ化
  const messagesByDate = messages.reduce<Record<string, Message[]>>(
    (acc, message) => {
      const date = formatDateToYYYYMMDD(message.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    },
    {}
  );

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {Object.entries(messagesByDate).map(([date, messagesForDate]) => (
        <div key={date}>
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">{date}</span>
          </div>

          <div className="space-y-4">
            {messagesForDate.map((message) => {
              const isSentByCurrentUser = message.senderId === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1 ${
                    isSentByCurrentUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-[22px] text-lg max-w-[80%] ${
                      isSentByCurrentUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-black'
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 px-1">
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.sent && isSentByCurrentUser && <span>送信済み</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
