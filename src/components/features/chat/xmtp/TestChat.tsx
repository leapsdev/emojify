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

type GroupMember = {
  address: string;
};

let xmtpClient: Client | null = null;

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
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);

  useEffect(() => {
    if (authenticated && address && !client) {
      initXmtpClient();
    }
    // クリーンアップ関数
    return () => {
      setMessages([]);
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

      // 既存のクライアントを再利用
      if (xmtpClient) {
        setClient(xmtpClient);
        return;
      }

      const signer = {
        getAddress: async () => address,
        signMessage: async (message: string | Uint8Array) => {
          const messageString = typeof message === 'string' ? message : new TextDecoder().decode(message);
          return viemSignMessage(address as Address, messageString);
        }
      };

      xmtpClient = await Client.create(signer, {
        env: 'production'
      });
      
      setClient(xmtpClient);

      // 既存の会話を読み込む
      const conversations = await xmtpClient.conversations.list();
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

    } catch (err) {
      console.error('XMTPクライアントの初期化に失敗:', err);
      setError(err instanceof Error ? err.message : 'メッセージングの初期化に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!isAddress(recipientAddress)) return;

    try {
      if (!client) {
        throw new Error('XMTPクライアントが初期化されていません');
      }

      const canMessage = await client.canMessage(recipientAddress);
      if (!canMessage) {
        throw new Error(
          `指定されたアドレス（${recipientAddress}）はXMTPネットワーク上に存在しません。\n` +
          'XMTPを利用するには、参加者もXMTPネットワークに参加している必要があります。\n' +
          '参加者に https://xmtp.chat でXMTPをセットアップするよう依頼してください。'
        );
      }

      // メンバーが既に存在するか確認
      const memberExists = groupMembers.some(
        member => member.address.toLowerCase() === recipientAddress.toLowerCase()
      );

      if (!memberExists) {
        setGroupMembers(prev => [...prev, { address: recipientAddress }]);
      }

      setRecipientAddress('');
    } catch (err) {
      console.error('メンバーの追加に失敗:', err);
      setError(err instanceof Error ? err.message : 'メンバーの追加に失敗しました');
    }
  };

  const handleRemoveMember = (address: string) => {
    setGroupMembers(prev => prev.filter(member => member.address !== address));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || groupMembers.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      if (!client) {
        throw new Error('XMTPクライアントが初期化されていません');
      }

      // 全メンバーに送信
      for (const member of groupMembers) {
        const conversations = await client.conversations.list();
        let conversation = conversations.find(
          conv => conv.peerAddress.toLowerCase() === member.address.toLowerCase()
        );

        if (!conversation) {
          conversation = await client.conversations.newConversation(member.address);
        }

        await conversation.send(messageContent);
      }

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
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="メンバーのウォレットアドレス（0xで始まる42文字）"
            className={`flex-1 p-2 border rounded ${
              recipientAddress && !isValidAddress ? 'border-red-500' : ''
            }`}
          />
          <button
            type="button"
            onClick={handleAddMember}
            disabled={!isValidAddress || loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            追加
          </button>
        </div>
        {recipientAddress && !isValidAddress && (
          <p className="text-red-500 text-sm mt-1">
            有効なイーサリアムアドレスを入力してください
          </p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold mb-2">👥 グループメンバー</h3>
        {groupMembers.length === 0 ? (
          <p className="text-gray-500 text-sm">メンバーを追加してください</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {groupMembers.map((member) => (
              <div
                key={member.address}
                className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded"
              >
                <span className="text-sm truncate max-w-[200px]">
                  {member.address}
                </span>
                <button
                  onClick={() => handleRemoveMember(member.address)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded text-sm">
        <h3 className="font-bold mb-2">💡 使用方法</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>メンバーを追加してグループチャットを開始できます</li>
          <li>メンバーは事前にXMTPネットワークに参加している必要があります</li>
          <li>初めての方は https://xmtp.chat でセットアップできます</li>
        </ul>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 rounded p-4 mb-4">
        {loading ? (
          <div className="text-center">メッセージを読み込み中...</div>
        ) : error ? (
          <div className="text-red-500 text-center whitespace-pre-line">{error}</div>
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
          disabled={loading || groupMembers.length === 0}
        />
        <button
          type="submit"
          disabled={!messageContent.trim() || groupMembers.length === 0 || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          送信
        </button>
      </form>
    </div>
  );
}
