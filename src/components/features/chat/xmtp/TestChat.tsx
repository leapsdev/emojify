'use client';

import { Client } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import type { DecodedMessage } from '@xmtp/xmtp-js';
import { useAccount } from 'wagmi';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

export function TestChat() {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const { ready, authenticated, login } = usePrivy();
  const { user } = usePrivy();
  const { address } = useAccount();
  const [messages, setMessages] = useState<{
    id: string;
    senderAddress: string;
    content: string;
    sent: boolean;
    timestamp: Date;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const initClient = async () => {
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
              
              const walletClient = createWalletClient({
                chain: base,
                transport: custom(window.ethereum)
              });

              // 署名がキャンセルされた場合のエラーハンドリング
              try {
                const signature = await walletClient.signMessage({
                  account: address as `0x${string}`,
                  message: messageString
                });
                console.log('署名結果:', { signature });
                return signature;
              } catch (error) {
                if (error instanceof Error && error.message.includes('User rejected')) {
                  throw new Error('署名がキャンセルされました。XMTPの初期化には署名が必要です。');
                }
                throw error;
              }
            } catch (error) {
              console.error('署名エラー:', error);
              const errorMessage = error instanceof Error ? error.message : 'メッセージの署名に失敗しました';
              setError(errorMessage);
              throw new Error(errorMessage);
            }
          },
        };

        const clientOptions = {
          env: 'production' as const,
          skipContactPublishing: true,
        };

        const xmtp = await Client.create(signer, clientOptions);
        setClient(xmtp);
        setError(null);

        // 既存のメッセージを読み込む
        if (recipientAddress) {
          const conversation = await xmtp.conversations.newConversation(recipientAddress);
          const msgs = await conversation.messages();
          setMessages(
            msgs.map((msg: DecodedMessage) => ({
              id: msg.id,
              senderAddress: msg.senderAddress,
              content: msg.content,
              sent: true,
              timestamp: msg.sent,
            })),
          );
        }
      } catch (err) {
        console.error('XMTPクライアントの初期化に失敗:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('メッセージングの初期化に失敗しました');
        }
      } finally {
        setLoading(false);
      }
    };

    initClient();
  }, [user, recipientAddress, address]);

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
    if (!messageContent.trim() || !recipientAddress.trim() || !client) return;

    try {
      const conversation = await client.conversations.newConversation(recipientAddress);
      await conversation.send(messageContent);
      
      // メッセージを表示に追加
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderAddress: client.address,
        content: messageContent,
        sent: true,
        timestamp: new Date(),
      }]);
      
      setMessageContent('');
    } catch (err) {
      console.error('メッセージの送信に失敗:', err);
      setError('メッセージの送信に失敗しました');
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
