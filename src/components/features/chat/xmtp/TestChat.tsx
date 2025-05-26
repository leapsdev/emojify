'use client';

import { Client, Conversation } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
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
  isOnXMTP: boolean;
};

type MessageMap = Map<string, Message[]>;
type ConversationMap = Map<string, Conversation>;

let xmtpClient: Client | null = null;

export function TestChat() {
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const { ready, authenticated, login, user } = usePrivy();
  const { address } = useAccount();
  const { signMessage: viemSignMessage } = useViemWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isXMTPReady, setIsXMTPReady] = useState(false);
  const [conversations, setConversations] = useState<ConversationMap>(new Map());
  const [messages, setMessages] = useState<MessageMap>(new Map());

  const updateMessages = useCallback(async (peerAddress: string, conversation: Conversation) => {
    const messageList = await conversation.messages();
    const formattedMessages: Message[] = messageList.map(msg => ({
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
  }, [address]);

  const listenToMessages = useCallback(async (peerAddress: string, conversation: Conversation) => {
    try {
      const stream = await conversation.streamMessages();
      for await (const msg of stream) {
        // メッセージの重複を防ぐため、既存のメッセージをチェック
        const newMessage: Message = {
          id: msg.id,
          senderAddress: msg.senderAddress,
          content: msg.content ?? '',
          sent: msg.senderAddress === address,
          timestamp: msg.sent
        };
        
        setMessages(prev => {
          const newMap = new Map(prev);
          const existingMessages = newMap.get(peerAddress.toLowerCase()) || [];
          
          // IDによる重複チェック
          if (!existingMessages.some(m => m.id === msg.id)) {
            newMap.set(peerAddress.toLowerCase(), [...existingMessages, newMessage]);
          }
          return newMap;
        });
      }
    } catch (err) {
      console.error('メッセージストリームのエラー:', err);
      setError('メッセージの受信中にエラーが発生しました。再接続を試みています...');
      
      // エラー発生時は少し待ってから再接続を試みる
      setTimeout(() => {
        if (client) {
          listenToMessages(peerAddress, conversation).catch(console.error);
        }
      }, 5000);
    }
  }, [address, client]);

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
        setGroupMembers([{ address: xmtpClient.address, isOnXMTP: true }]);
        setIsXMTPReady(true);
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
      setGroupMembers([{ address: xmtpClient.address, isOnXMTP: true }]);
      setIsXMTPReady(true);

      // 既存の会話を読み込む
      const convList = await xmtpClient.conversations.list();
      const conversationMap: ConversationMap = new Map();
      
      for (const conversation of convList) {
        const peerAddress = conversation.peerAddress.toLowerCase();
        conversationMap.set(peerAddress, conversation);
        // メッセージを取得
        await updateMessages(peerAddress, conversation);
        // ストリームを開始
        listenToMessages(peerAddress, conversation).catch(console.error);
      }
      
      setConversations(conversationMap);

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

      // メンバーが既に存在するか確認
      const memberExists = groupMembers.some(
        member => member.address.toLowerCase() === recipientAddress.toLowerCase()
      );

      if (memberExists) {
        throw new Error('このアドレスは既にメンバーとして追加されています');
      }

      const canMessage = await client.canMessage(recipientAddress);
      const newMember = { address: recipientAddress, isOnXMTP: canMessage };
      
      setGroupMembers(prev => [...prev, newMember]);
      setRecipientAddress('');

      if (canMessage) {
        // 会話を開始
        const conversation = await client.conversations.newConversation(recipientAddress);
        const peerAddress = recipientAddress.toLowerCase();
        
        setConversations(prev => {
          const newMap = new Map(prev);
          newMap.set(peerAddress, conversation);
          return newMap;
        });

        // メッセージストリームを開始
        listenToMessages(peerAddress, conversation).catch(console.error);
      } else {
        setError(
          `メンバーを追加しましたが、このアドレス（${recipientAddress}）はまだXMTPネットワーク上に存在しません。\n` +
          'メッセージを送信するには、メンバーがXMTPネットワークに参加する必要があります。\n' +
          '参加者に https://xmtp.chat でXMTPをセットアップするよう依頼してください。'
        );
      }
    } catch (err) {
      console.error('メンバーの追加に失敗:', err);
      setError(err instanceof Error ? err.message : 'メンバーの追加に失敗しました');
    }
  };

  const handleRemoveMember = (address: string) => {
    if (address.toLowerCase() === client?.address.toLowerCase()) {
      setError('自分自身をグループから削除することはできません');
      return;
    }
    setGroupMembers(prev => prev.filter(member => member.address !== address));
    
    // 会話と関連メッセージを削除
    const peerAddress = address.toLowerCase();
    setConversations(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerAddress);
      return newMap;
    });
    setMessages(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerAddress);
      return newMap;
    });
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

      const activeMembers = groupMembers.filter(member => member.isOnXMTP);
      if (activeMembers.length === 0) {
        throw new Error('メッセージを送信できるメンバーがいません');
      }

      // XMTPに参加しているメンバーにのみ送信
      for (const member of activeMembers) {
        if (member.address.toLowerCase() === client.address.toLowerCase()) continue;

        const peerAddress = member.address.toLowerCase();
        let conversation = conversations.get(peerAddress);

        if (!conversation) {
          const newConversation = await client.conversations.newConversation(member.address);
          setConversations(prev => {
            const newMap = new Map(prev);
            newMap.set(peerAddress, newConversation);
            return newMap;
          });
          // メッセージストリームを開始
          listenToMessages(peerAddress, newConversation).catch(console.error);
          await newConversation.send(messageContent);
        } else {
          await conversation.send(messageContent);
        }
      }

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

  // グループ内の全メッセージを取得
  const getAllMessages = () => {
    const allMessages: Message[] = [];
    messages.forEach((msgs) => {
      allMessages.push(...msgs);
    });
    // タイムスタンプでソート
    return allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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
      {isXMTPReady && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-sm">
          ✅ XMTPネットワークに接続済み
        </div>
      )}
      
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
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  member.isOnXMTP ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <span className="text-sm truncate max-w-[200px]">
                  {member.address === client?.address ? `${member.address} (自分)` : member.address}
                </span>
                {!member.isOnXMTP && (
                  <span className="text-yellow-600 text-xs">未参加</span>
                )}
                {member.address !== client?.address && (
                  <button
                    onClick={() => handleRemoveMember(member.address)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
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
          <li>XMTPに未参加のメンバーには送信できません</li>
        </ul>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 rounded p-4 mb-4">
        {loading ? (
          <div className="text-center">メッセージを読み込み中...</div>
        ) : error ? (
          <div className="text-red-500 text-center whitespace-pre-line">{error}</div>
        ) : getAllMessages().length === 0 ? (
          <div className="text-center text-gray-500">
            メッセージはありません
          </div>
        ) : (
          <div className="space-y-4">
            {getAllMessages().map((msg) => (
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
                  送信者: {msg.senderAddress.slice(0, 6)}...{msg.senderAddress.slice(-4)}
                </div>
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
          disabled={loading || !isXMTPReady || groupMembers.length === 0}
        />
        <button
          type="submit"
          disabled={!messageContent.trim() || !isXMTPReady || groupMembers.length === 0 || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          送信
        </button>
      </form>
    </div>
  );
}
