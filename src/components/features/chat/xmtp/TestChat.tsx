'use client';

import { Client, Conversation } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useViemWallet } from './hooks/useViemWallet';
import { Address, isAddress } from 'viem';
import { MessageList } from '@/components/features/chat/chat-room/MessageList';
import { ChatRoomInput } from '@/components/features/chat/chat-room/ChatInput';
import type { Message as DBMessage } from '@/repository/db/database';
type XMTPMessage = {
  id: string;
  senderAddress: string;
  content: string;
  sent: boolean;
  timestamp: Date;
};

type MessageMap = Map<string, XMTPMessage[]>;
type ConversationMap = Map<string, Conversation>;

let xmtpClient: Client | null = null;

function TestChatContent() {
  const { ready, authenticated, login, user } = usePrivy();
  const { address } = useAccount();
  const { signMessage: viemSignMessage } = useViemWallet();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isXMTPReady, setIsXMTPReady] = useState(false);
  const [conversations, setConversations] = useState<ConversationMap>(new Map());
  const [messages, setMessages] = useState<MessageMap>(new Map());

  // XMTPメッセージをDBメッセージ形式に変換
  const formattedMessages = useMemo(() => {
    const allMessages = Array.from(messages.values()).flat();
    return allMessages.map(msg => ({
      id: msg.id,
      roomId: 'test-room',
      senderId: msg.senderAddress,
      content: msg.content,
      createdAt: msg.timestamp.getTime(),
      sent: msg.sent
    }));
  }, [messages]);

  const updateMessages = useCallback(async (peerAddress: string, conversation: Conversation) => {
    try {
      const messageList = await conversation.messages();
      const formattedMessages: XMTPMessage[] = messageList.map(msg => ({
        id: msg.id,
        senderAddress: msg.senderAddress,
        content: msg.content ?? '',
        sent: msg.senderAddress === address,
        timestamp: msg.sent
      }));
      setMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(peerAddress.toLowerCase(), formattedMessages);
        return newMap;
      });
    } catch (err) {
      console.error('メッセージの取得に失敗:', err);
    }
  }, [address]);

  const listenToMessages = useCallback(async (peerAddress: string, conversation: Conversation) => {
    try {
      const stream = await conversation.streamMessages();
      for await (const msg of stream) {
        const newMessage: XMTPMessage = {
          id: msg.id,
          senderAddress: msg.senderAddress,
          content: msg.content ?? '',
          sent: msg.senderAddress === address,
          timestamp: msg.sent
        };
        
        setMessages(prev => {
          const newMap = new Map(prev);
          const existingMessages = newMap.get(peerAddress.toLowerCase()) || [];
          if (!existingMessages.some(m => m.id === msg.id)) {
            newMap.set(peerAddress.toLowerCase(), [...existingMessages, newMessage]);
          }
          return newMap;
        });
      }
    } catch (err) {
      console.error('メッセージストリームのエラー:', err);
      setError('メッセージの受信中にエラーが発生しました。再接続を試みています...');
      
      if (client) {
        setTimeout(() => {
          listenToMessages(peerAddress, conversation).catch(console.error);
        }, 5000);
      }
    }
  }, [address, client]);

  useEffect(() => {
    if (client) {
      import('./actions').then(({ setXMTPClient }) => {
        setXMTPClient(client).catch(console.error);
      });
    }
  }, [client]);

  useEffect(() => {
    if (authenticated && address && !client) {
      initXmtpClient();
    }
    return () => {
      setMessages(new Map());
      setConversations(new Map());
      setError(null);
    };
  }, [authenticated, address]);

  const initXmtpClient = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.wallet || !address) {
        throw new Error('ウォレットアドレスが見つかりません');
      }

      if (xmtpClient) {
        setClient(xmtpClient);
        setIsXMTPReady(true);
        return;
      }

      const signer = {
        getAddress: async () => address,
        signMessage: async (message: string | Uint8Array) => {
          const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message);
          return await viemSignMessage(address as Address, messageString);
        }
      };

      xmtpClient = await Client.create(signer, { env: 'dev' });
      setClient(xmtpClient);
      setIsXMTPReady(true);

      try {
        const convList = await xmtpClient.conversations.list();
        const conversationMap: ConversationMap = new Map();
        
        for (const conversation of convList) {
          try {
            const peerAddress = conversation.peerAddress.toLowerCase();
            conversationMap.set(peerAddress, conversation);
            await updateMessages(peerAddress, conversation);
            listenToMessages(peerAddress, conversation).catch(console.error);
          } catch (err) {
            console.error('会話の処理中にエラー:', err);
          }
        }
        
        setConversations(conversationMap);
      } catch (err) {
        console.error('会話一覧の取得に失敗:', err);
        setError('会話履歴の取得に失敗しました。ページを再読み込みしてください。');
      }

    } catch (err) {
      console.error('XMTPクライアントの初期化に失敗:', err);
      setError(err instanceof Error ? err.message : 'メッセージングの初期化に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <button
          type="button"
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログインしてチャットを開始
        </button>
      </div>
    );
  }

  return (
    <main className="flex flex-col relative">
      {isXMTPReady && (
        <div className="p-2 bg-green-100 text-green-800 text-sm">
          ✅ XMTPネットワークに接続済み
        </div>
      )}
      <div className="overflow-y-auto pb-24">
        <MessageList
          roomId="test-room"
          currentUserId={address || ''}
          initialMessages={formattedMessages}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        {!loading && !error && (
          <ChatRoomInput 
            roomId="test-room" 
            userId={address || ''} 
          />
        )}
        {error && (
          <div className="p-4 text-red-500 text-center">{error}</div>
        )}
      </div>
    </main>
  );
}

export function TestChat() {
  return <TestChatContent />;
}
