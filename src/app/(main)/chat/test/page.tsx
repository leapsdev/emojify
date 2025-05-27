'use client';

import { useEffect, useState } from 'react';
import { useWalletClient } from 'wagmi';
import { XmtpProvider, useClient } from './XmtpProvider';
import { Conversation, DecodedMessage } from '@xmtp/browser-sdk';

function Chat() {
  const { data: walletClient } = useWalletClient();
  const { client, initialize } = useClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ message: DecodedMessage; isSender: boolean }[]>([]);

  useEffect(() => {
    const initializeClient = async () => {
      if (walletClient) {
        try {
          await initialize(walletClient);
        } catch (error) {
          console.error('Error initializing client:', error);
        }
      }
    };

    initializeClient();
  }, [walletClient, initialize]);

  useEffect(() => {
    if (!selectedConversation) return;

    // メッセージストリームの購読
    const stream = async () => {
      try {
        const messageStream = await selectedConversation.stream();
        for await (const message of messageStream) {
          if (message) {
            // 受信したメッセージを処理
            setMessages((prevMessages) => [
              ...prevMessages,
              { message: message as DecodedMessage, isSender: false }
            ]);
          }
        }
      } catch (error) {
        console.error('Error streaming messages:', error);
      }
    };

    stream();
  }, [selectedConversation]);

  const startNewConversation = async (peerAddress: string) => {
    if (!client) return;

    try {
      const conversation = await client.conversations.newDm(peerAddress);
      setSelectedConversation(conversation);

      // 過去のメッセージを読み込む
      const historicalMessages = await conversation.messages();
      setMessages(historicalMessages.map(msg => ({
        message: msg,
        isSender: false // 履歴メッセージは全て受信メッセージとして扱う
      })));
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !message.trim()) return;

    try {
      await selectedConversation.send(message);
      // 送信したメッセージをDecodedMessage型として処理
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {!client ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* チャット相手の入力フォーム */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter peer address"
              className="flex-1 p-2 border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  startNewConversation(e.currentTarget.value);
                }
              }}
            />
          </div>

          {/* メッセージ表示エリア */}
          <div className="flex-1 min-h-[300px] border rounded p-4 overflow-y-auto">
            {messages.map(({ message: msg, isSender }, index) => {
              const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
              return (
                <div key={index} className="mb-2">
                  <strong>{isSender ? 'You' : 'Peer'}: </strong>
                  {content}
                </div>
              );
            })}
          </div>

          {/* メッセージ入力フォーム */}
          {selectedConversation && (
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TestPage() {
  return (
    <XmtpProvider>
      <Chat />
    </XmtpProvider>
  );
}
