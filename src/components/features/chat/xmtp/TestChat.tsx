'use client';

import { Client } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useViemWallet } from './hooks/useViemWallet';

export function TestChat() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const { ready, authenticated, login } = usePrivy();
  const { user } = usePrivy();
  const { address } = useAccount();
  const { signMessage: viemSignMessage } = useViemWallet();
  const [messages, setMessages] = useState<{
    id: string;
    senderAddress: string;
    content: string;
    sent: boolean;
    timestamp: Date;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const initXmtpClient = async () => {
    try {
      if (!user?.wallet || !address) {
        throw new Error('ウォレットアドレスが見つかりません');
      }

      const signer = {
        getAddress: async () => address,
        signMessage: async (message: string | Uint8Array) => {
          try {
            const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message);
            console.log('署名リクエスト:', { messageString });
            
            const signature = await viemSignMessage(address, messageString);
            console.log('署名結果:', { signature });
            return signature;
          } catch (error) {
            console.error('署名エラー:', error);
            const errorMessage = error instanceof Error ? error.message : 'メッセージの署名に失敗しました';
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      };

      const clientOptions = {
        env: 'production' as const,
        skipContactPublishing: true,
      };

      const xmtp = await Client.create(signer, clientOptions);
      setClient(xmtp);
      setError(null);
      return xmtp;

    } catch (err) {
      console.error('XMTPクライアントの初期化に失敗:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('メッセージングの初期化に失敗しました');
      }
      throw err; // 上位のエラーハンドリングに伝播させる
    }
  };

  if (!ready) {
    return <div>Loading...</div>;
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !recipientAddress.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // クライアントの初期化または取得
      const currentClient = client || await initXmtpClient();
      if (!currentClient) {
        throw new Error('XMTPクライアントの初期化に失敗しました。再度お試しください。');
      }
      setLoading(false);

      // 宛先がXMTPネットワーク上に存在するか確認
      // 宛先の検証
      const canMessage = await currentClient.canMessage(recipientAddress);
      if (!canMessage) {
        setError(`指定されたアドレス（${recipientAddress}）はXMTPネットワーク上に存在しません。\n宛先アドレスを確認してください。`);
        return;
      }

      // メッセージの送信
      const conversation = await currentClient.conversations.newConversation(recipientAddress);
      await conversation.send(messageContent);
      
      // メッセージを表示に追加
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderAddress: currentClient.address,
        content: messageContent,
        sent: true,
        timestamp: new Date(),
      }]);
      
      setMessageContent('');
    } catch (err) {
      console.error('メッセージの送信に失敗:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('メッセージの送信に失敗しました');
      }
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
