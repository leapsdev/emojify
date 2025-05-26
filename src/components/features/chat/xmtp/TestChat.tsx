'use client';

import { Client } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useViemWallet } from './hooks/useViemWallet';
import { Address, isAddress } from 'viem';

type Message = {
  id: string;
  senderAddress: string;
  content: string;
  sent: boolean;
  timestamp: Date;
};

export function TestChat() {
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const { ready, authenticated, login, user } = usePrivy();
  const { address } = useAccount();
  const { signMessage: viemSignMessage } = useViemWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (authenticated && address && !client) {
      initXmtpClient();
    }
  }, [authenticated, address, client]);

  const initXmtpClient = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.wallet || !address) {
        throw new Error('ウォレットアドレスが見つかりません');
      }

      const signer = {
        getAddress: async () => address,
        signMessage: async (message: string | Uint8Array) => {
          const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message);
          return viemSignMessage(address as Address, messageString);
        }
      };

      const xmtp = await Client.create(signer, {
        env: 'production'
      });

      setClient(xmtp);
      
      // 既存の会話を読み込む
      const conversations = await xmtp.conversations.list();
      for (const conversation of conversations) {
        const messageList = await conversation.messages();
        const formattedMessages: Message[] = messageList.map(msg => ({
          id: msg.id,
          senderAddress: msg.senderAddress,
          content: msg.content ?? '',
          sent: msg.senderAddress === address,
          timestamp: msg.sent
        }));
        setMessages(prev => [...prev, ...formattedMessages]);
      }

      // メッセージのストリームを購読
      for (const conversation of conversations) {
        const stream = await conversation.streamMessages();
        for await (const msg of stream) {
          const newMessage: Message = {
            id: msg.id,
            senderAddress: msg.senderAddress,
            content: msg.content ?? '',
            sent: msg.senderAddress === address,
            timestamp: msg.sent
          };
          setMessages(prev => [...prev, newMessage]);
        }
      }

    } catch (err) {
      console.error('XMTPクライアントの初期化に失敗:', err);
      setError(err instanceof Error ? err.message : 'メッセージングの初期化に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !isAddress(recipientAddress)) return;

    setLoading(true);
    setError(null);

    try {
      if (!client) {
        throw new Error('XMTPクライアントが初期化されていません');
      }

      const canMessage = await client.canMessage(recipientAddress);
      if (!canMessage) {
        throw new Error(`指定されたアドレス（${recipientAddress}）はXMTPネットワーク上に存在しません`);
      }

      const conversation = await client.conversations.newConversation(recipientAddress);
      await conversation.send(messageContent);

      const newMessage: Message = {
        id: Date.now().toString(),
        senderAddress: client.address,
        content: messageContent,
        sent: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageContent('');
      
    } catch (err) {
      console.error('メッセージの送信に失敗:', err);
      setError(err instanceof Error ? err.message : 'メッセージの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (input: string) => {
    // 入力された文字列が16進数のみで構成されているか確認
    if (/^(0x)?[0-9a-fA-F]*$/.test(input)) {
      const formattedAddress = input.startsWith('0x') ? input : `0x${input}`;
      setRecipientAddress(formattedAddress);
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

  const isValidAddress = isAddress(recipientAddress);

  return (
    <div className="flex flex-col h-screen p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="宛先のウォレットアドレス（0xで始まる42文字）"
          className={`w-full p-2 border rounded ${
            recipientAddress && !isValidAddress ? 'border-red-500' : ''
          }`}
        />
        {recipientAddress && !isValidAddress && (
          <p className="text-red-500 text-sm mt-1">
            有効なイーサリアムアドレスを入力してください
          </p>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 rounded p-4 mb-4">
        {loading ? (
          <div className="text-center">メッセージを読み込み中...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            メッセージはありません
          </div>
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
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!messageContent.trim() || !isValidAddress || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          送信
        </button>
      </form>
    </div>
  );
}
