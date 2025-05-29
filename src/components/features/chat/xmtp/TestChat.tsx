'use client';

import { Client, Conversation } from '@xmtp/xmtp-js';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useViemWallet } from './hooks/useViemWallet';
import { Address, isAddress } from 'viem';
import { GroupList } from '@/components/features/chat/xmtp/GroupList';
import { GroupMembers } from '@/components/features/chat/xmtp/GroupMembers';
import { Group } from './types';

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
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

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
      console.log('メッセージストリーム開始:', peerAddress);
      const stream = await conversation.streamMessages();
      console.log('メッセージストリーム取得成功');

      for await (const msg of stream) {
        console.log('メッセージを受信:', {
          id: msg.id,
          senderAddress: msg.senderAddress,
          content: msg.content
        });

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
            console.log('新しいメッセージを追加');
            newMap.set(peerAddress.toLowerCase(), [...existingMessages, newMessage]);
          } else {
            console.log('重複メッセージをスキップ');
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
          console.log('メッセージストリームの再接続を試みます');
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
        env: 'dev',
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

      console.log('メンバー追加処理開始:', {
        recipientAddress,
        clientAddress: client.address
      });

      // メンバーが既に存在するか確認
      const memberExists = groupMembers.some(
        member => member.address.toLowerCase() === recipientAddress.toLowerCase()
      );

      if (memberExists) {
        throw new Error('このアドレスは既にメンバーとして追加されています');
      }

      console.log('XMTP初期化状態を確認中:', recipientAddress);
      const canMessage = await client.canMessage(recipientAddress);
      console.log('XMTP初期化状態の結果:', {
        address: recipientAddress,
        canMessage
      });

      // メンバーを追加（XMTPの初期化状態に関係なく）
      const newMember = { address: recipientAddress, isOnXMTP: canMessage };
      console.log('新しいメンバーを追加:', newMember);
      
      // メンバーを追加
      setGroupMembers(prev => {
        const updatedMembers = [...prev, newMember];
        console.log('更新後のメンバー一覧:', updatedMembers);
        return updatedMembers;
      });
      
      setRecipientAddress('');

      if (canMessage) {
        try {
          // 会話を開始
          console.log('新しい会話を作成開始:', recipientAddress);
          const conversation = await client.conversations.newConversation(recipientAddress);
          const peerAddress = recipientAddress.toLowerCase();
          
          console.log('新しい会話を作成完了:', {
            peerAddress,
            conversationTopic: conversation.topic
          });

          // 会話を保存
          setConversations(prev => {
            const newMap = new Map(prev);
            newMap.set(peerAddress, conversation);
            console.log('更新後の会話一覧:', Array.from(newMap.entries()));
            return newMap;
          });

          // メッセージストリームを開始
          console.log('メッセージストリームを開始:', peerAddress);
          listenToMessages(peerAddress, conversation).catch(err => {
            console.error('メッセージストリームの開始に失敗:', err);
          });

          // 既存のメッセージを取得
          console.log('既存のメッセージを取得:', peerAddress);
          await updateMessages(peerAddress, conversation);
        } catch (err) {
          console.error('会話の作成に失敗:', err);
          setError('会話の作成に失敗しました。もう一度お試しください。');
        }
      } else {
        console.log('メンバーを追加しましたが、XMTPは初期化されていません:', recipientAddress);
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

  // メンバー追加後の状態を確認するためのデバッグ用エフェクト
  useEffect(() => {
    console.log('現在のメンバー一覧:', groupMembers);
  }, [groupMembers]);

  // 会話一覧の状態を確認するためのデバッグ用エフェクト
  useEffect(() => {
    console.log('現在の会話一覧:', Array.from(conversations.entries()));
  }, [conversations]);

  // メッセージ一覧の状態を確認するためのデバッグ用エフェクト
  useEffect(() => {
    console.log('現在のメッセージ一覧:', Array.from(messages.entries()));
  }, [messages]);

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

      console.log('送信開始:', {
        messageContent,
        groupMembers,
        clientAddress: client.address
      });

      const activeMembers = groupMembers.filter(member => member.isOnXMTP);
      console.log('アクティブメンバー:', activeMembers);

      if (activeMembers.length === 0) {
        throw new Error('メッセージを送信できるメンバーがいません');
      }

      // 送信したメッセージを作成
      const sentMessage: Message = {
        id: `sent-${Date.now()}`,
        senderAddress: client.address,
        content: messageContent,
        sent: true,
        timestamp: new Date()
      };

      console.log('送信するメッセージ:', sentMessage);

      // 自分自身のメッセージを追加
      setMessages(prev => {
        const newMap = new Map(prev);
        const existingMessages = newMap.get(client.address.toLowerCase()) || [];
        newMap.set(client.address.toLowerCase(), [...existingMessages, sentMessage]);
        return newMap;
      });

      let hasSentMessage = false;

      // 各メンバーにメッセージを送信
      for (const member of activeMembers) {
        const peerAddress = member.address.toLowerCase();
        
        // 自分自身へのメッセージ送信はスキップ
        if (peerAddress === client.address.toLowerCase()) {
          console.log('自分自身への送信はスキップ:', peerAddress);
          continue;
        }

        console.log('メンバーへの送信開始:', peerAddress);

        try {
          // 会話の取得または作成
          let conversation = conversations.get(peerAddress);
          if (!conversation) {
            console.log('新しい会話を作成');
            conversation = await client.conversations.newConversation(member.address);
            console.log('新しい会話を作成完了:', conversation.topic);

            setConversations(prev => {
              const newMap = new Map(prev);
              newMap.set(peerAddress, conversation!);
              return newMap;
            });

            // メッセージストリームを開始
            listenToMessages(peerAddress, conversation).catch(err => {
              console.error('メッセージストリームの開始に失敗:', err);
            });
          }

          if (!conversation) {
            throw new Error('会話の作成に失敗しました');
          }

          // メッセージを送信
          console.log('メッセージを送信:', {
            to: peerAddress,
            content: messageContent
          });
          await conversation.send(messageContent);
          console.log('メッセージ送信完了');

          // 送信したメッセージを追加
          setMessages(prev => {
            const newMap = new Map(prev);
            const existingMessages = newMap.get(peerAddress) || [];
            newMap.set(peerAddress, [...existingMessages, sentMessage]);
            return newMap;
          });

          hasSentMessage = true;
          console.log('メッセージをステートに追加完了');

        } catch (err) {
          console.error(`メンバー ${peerAddress} への送信に失敗:`, err);
          throw err;
        }
      }

      if (!hasSentMessage) {
        console.log('送信可能なメンバーがいないため、メッセージは送信されませんでした');
      }

      setMessageContent('');
      console.log('送信処理完了');
      
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

  // グループの作成
  const handleCreateGroup = async (name: string) => {
    if (!client) {
      setError('XMTPクライアントが初期化されていません');
      return;
    }

    try {
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name,
        members: [{ address: client.address, isOnXMTP: true }],
        conversation: null
      };

      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setShowGroupManagement(true);
    } catch (err) {
      console.error('グループの作成に失敗:', err);
      setError(err instanceof Error ? err.message : 'グループの作成に失敗しました');
    }
  };

  // グループの更新
  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ));
    setSelectedGroup(updatedGroup);
  };

  // グループの選択
  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupManagement(true);
    // グループのメンバーを設定
    setGroupMembers(group.members);
  };

  // グループ管理を閉じる
  const handleCloseGroupManagement = () => {
    setShowGroupManagement(false);
    setSelectedGroup(null);
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
    <div className="flex flex-col h-screen bg-gray-50">
      {isXMTPReady && (
        <div className="p-2 bg-green-100 text-green-800 text-sm">
          ✅ XMTPネットワークに接続済み
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* 左サイドバー - グループ一覧 */}
        <div className="w-56 min-w-[220px] max-w-[260px] border-r border-gray-200 bg-white">
          <GroupList
            client={client}
            groups={groups}
            onCreateGroup={handleCreateGroup}
            onSelectGroup={handleGroupSelect}
          />
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col p-4">
          {showGroupManagement ? (
            <GroupMembers
              client={client}
              group={selectedGroup}
              onUpdateGroup={handleUpdateGroup}
              onClose={handleCloseGroupManagement}
            />
          ) : (
            <>
              <div className="mb-4">
                <div className="flex gap-2">
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
            </>
          )}

          {/* メッセージ表示エリア */}
          <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm p-4 mb-4 min-h-[400px]">
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
                    className={`p-3 rounded-lg max-w-[90%] ${
                      msg.sent
                        ? 'ml-auto bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm break-words">{msg.content}</div>
                    <div className="text-xs opacity-75 mt-1">
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

          {/* メッセージ入力エリア */}
          <form onSubmit={handleSend} className="flex gap-2 bg-white p-4 rounded-lg shadow-sm">
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !isXMTPReady || groupMembers.length === 0}
            />
            <button
              type="submit"
              disabled={!messageContent.trim() || !isXMTPReady || groupMembers.length === 0 || loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              送信
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
