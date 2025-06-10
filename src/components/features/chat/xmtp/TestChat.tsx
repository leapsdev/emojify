'use client';

import { Client, Conversation } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useViemWallet } from './hooks/useViemWallet';
import { Address, isAddress } from 'viem';
import { MessageList } from '@/components/features/chat/chat-room/MessageList';
import { ChatRoomInput } from '@/components/features/chat/chat-room/ChatInput';
import type { Message as DBMessage } from '@/repository/db/database';
import { EmojiPicker } from '@/components/features/chat/chat-room/EmojiPicker';
import { useEmojiInput } from '@/components/features/chat/chat-room/hooks/useEmojiInput';
import { Send } from 'lucide-react';
import { formatDateToYYYYMMDD } from '@/lib/utils';

// グローバル型の拡張
declare global {
  interface Window {
    customSendMessage?: (content: string) => Promise<void>;
  }
}

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
  
  // 追加: 現在のチャット相手を管理
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // XMTPメッセージをDBメッセージ形式に変換 - 現在の会話のメッセージのみ表示
  const formattedMessages = useMemo(() => {
    if (!recipientAddress) return [];
    
    const currentMessages = messages.get(recipientAddress.toLowerCase()) || [];
    return currentMessages.map(msg => ({
      id: msg.id,
      roomId: 'test-room',
      senderId: msg.senderAddress,
      content: msg.content,
      createdAt: msg.timestamp.getTime(),
      sent: msg.sent
    }));
  }, [messages, recipientAddress]);

  // 会話を開始または選択する関数
  const startConversation = useCallback(async (peerAddress: string) => {
    if (!client || !isAddress(peerAddress)) return;
    
    try {
      setLoading(true);
      const normalizedAddress = peerAddress.toLowerCase();
      
      let conversation = conversations.get(normalizedAddress);
      
      if (!conversation) {
        // 新しい会話を作成
        conversation = await client.conversations.newConversation(peerAddress);
        setConversations(prev => {
          const newMap = new Map(prev);
          newMap.set(normalizedAddress, conversation!);
          return newMap;
        });
        
        // メッセージを取得してリスニング開始
        await updateMessages(normalizedAddress, conversation);
        listenToMessages(normalizedAddress, conversation).catch(console.error);
      }
      
      setRecipientAddress(peerAddress);
      setCurrentConversation(conversation);
    } catch (err) {
      console.error('会話の開始に失敗:', err);
      setError('会話の開始に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [client, conversations]);

  // メッセージ送信関数をカスタム実装
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation || !client || !address) {
      throw new Error('会話が選択されていません');
    }

    try {
      const sentMessage = await currentConversation.send(content);
      
      // 送信したメッセージを即座にUIに反映
      const newMessage: XMTPMessage = {
        id: sentMessage.id, // 実際のメッセージIDを使用
        senderAddress: address,
        content,
        sent: true,
        timestamp: sentMessage.sent
      };
      
      setMessages(prev => {
        const newMap = new Map(prev);
        const existingMessages = newMap.get(recipientAddress.toLowerCase()) || [];
        // 重複チェックを追加
        if (!existingMessages.some(m => m.id === sentMessage.id)) {
          newMap.set(recipientAddress.toLowerCase(), [...existingMessages, newMessage]);
        }
        return newMap;
      });
      
    } catch (err) {
      console.error('メッセージの送信に失敗:', err);
      throw new Error('メッセージの送信に失敗しました');
    }
  }, [currentConversation, client, address, recipientAddress]);

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
          // 重複チェックを追加
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

  // カスタムsendMessageActionを設定
  useEffect(() => {
    if (client) {
      // グローバルなsendMessageActionをオーバーライド
      window.customSendMessage = sendMessage;
    }
  }, [client, sendMessage]);

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
      
      {/* 送信先選択UI */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-col gap-2">
          <label htmlFor="recipient" className="text-sm font-medium">
            送信先アドレス:
          </label>
          <div className="flex gap-2">
            <input
              id="recipient"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => startConversation(recipientAddress)}
              disabled={!recipientAddress || !isAddress(recipientAddress) || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '接続中...' : '会話開始'}
            </button>
          </div>
        </div>
        
        {/* 既存の会話一覧 */}
        {conversations.size > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">既存の会話:</div>
            <div className="flex flex-wrap gap-2">
              {Array.from(conversations.keys()).map(peerAddress => (
                <button
                  key={peerAddress}
                  onClick={() => {
                    setRecipientAddress(peerAddress);
                    setCurrentConversation(conversations.get(peerAddress) || null);
                  }}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    recipientAddress.toLowerCase() === peerAddress
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {peerAddress.slice(0, 6)}...{peerAddress.slice(-4)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-y-auto pb-24">
        <CustomMessageList
          messages={formattedMessages}
          currentUserId={address || ''}
        />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        {!loading && !error && currentConversation && (
          <CustomChatInput onSendMessage={sendMessage} />
        )}
        {!currentConversation && !loading && (
          <div className="p-4 text-center text-gray-500">
            送信先を選択してください
          </div>
        )}
        {error && (
          <div className="p-4 text-red-500 text-center">{error}</div>
        )}
      </div>
    </main>
  );
}

// カスタムチャット入力コンポーネント
function CustomChatInput({ onSendMessage }: { onSendMessage: (content: string) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    message,
    showEmojiPicker,
    emojiPickerRef,
    inputRef,
    deleteButtonRef,
    handleEmojiClick,
    handleDeleteLastEmoji,
    toggleEmojiPicker,
    clearMessage,
  } = useEmojiInput();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    try {
      setIsLoading(true);
      await onSendMessage(trimmedMessage);
      clearMessage();
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <EmojiPicker
            message={message}
            showEmojiPicker={showEmojiPicker}
            emojiPickerRef={emojiPickerRef}
            inputRef={inputRef}
            deleteButtonRef={deleteButtonRef}
            onEmojiClick={handleEmojiClick}
            onDeleteLastEmoji={handleDeleteLastEmoji}
            onToggleEmojiPicker={toggleEmojiPicker}
          />
          <button
            type="submit"
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
            disabled={isLoading || !message.trim()}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}

// カスタムメッセージリストコンポーネント
function CustomMessageList({ messages, currentUserId }: { messages: DBMessage[], currentUserId: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 初期スクロール
    scrollToBottom();

    // メッセージコンテナの監視を設定
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const observer = new MutationObserver(scrollToBottom);

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  if (!messages.length) {
    return (
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <p className="text-gray-500">メッセージはありません</p>
      </div>
    );
  }

  // 日付でメッセージをグループ化
  const messagesByDate = messages.reduce<Record<string, DBMessage[]>>(
    (acc, message) => {
      const date = formatDateToYYYYMMDD(message.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    },
    {},
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
                    className={`px-4 py-2 rounded-[22px] text-4xl max-w-[80%] ${
                      isSentByCurrentUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-black'
                    } inline-block`}
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
      <div ref={messagesEndRef} />
    </div>
  );
}

export function TestChat() {
  return <TestChatContent />;
}
