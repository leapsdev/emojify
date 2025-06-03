'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initializeXMTPClient } from '@/repository/db/XMTP/client';
import { addMember, createGroup } from '@/repository/db/XMTP/group';
import { sendMessage, streamMessages } from '@/repository/db/XMTP/messaging';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { Client, DecodedMessage, Group } from '@xmtp/browser-sdk';
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from 'react';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

interface GroupData {
  id: string;
  name: string;
  members: string[];
  group: Group<string> | null;
}

export default function TestChatPage() {
  const { login, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');

  // XMTPクライアントの初期化
  useEffect(() => {
    if (!ready) return;

    const initClient = async () => {
      try {
        if (!authenticated || wallets.length === 0) {
          console.log('ウォレットが接続されていません');
          return;
        }

        const wallet = wallets[0];
        console.log('ウォレット情報:', wallet);

        // プロバイダーを取得
        const provider = await wallet.getEthereumProvider();
        if (!provider) {
          console.error('ウォレットのプロバイダーが見つかりません');
          return;
        }

        // クライアントを作成
        const xmtpClient = await initializeXMTPClient({
          provider,
          address: wallet.address,
          chainType: 'ethereum',
          imported: false,
          delegated: false,
          walletIndex: 0,
        });

        // クライアントの初期化を待機
        let retryCount = 0;
        const maxRetries = 10;
        while (!xmtpClient.isReady && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retryCount++;
          console.log(
            `クライアントの初期化を待機中... (${retryCount}/${maxRetries})`,
          );
        }

        if (!xmtpClient.isReady) {
          throw new Error('クライアントの初期化がタイムアウトしました');
        }

        console.log('XMTPクライアントが初期化されました');
        setClient(xmtpClient);
      } catch (error) {
        console.error('XMTPクライアントの初期化に失敗しました:', error);
      }
    };

    initClient();
  }, [ready, authenticated, wallets]);

  // メッセージのストリーミング
  useEffect(() => {
    if (client && selectedGroup?.group) {
      const handleMessage = (message: DecodedMessage<string>) => {
        console.log('XMTP message object:', message);
        if (typeof message.content === 'string') {
          // 仮のプロパティ名で一旦unknownを入れる
          const newMessage: Message = {
            id: message.id,
            content: message.content,
            sender: 'unknown',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      };

      streamMessages(selectedGroup.group, handleMessage);
    }
  }, [client, selectedGroup]);

  const handleCreateGroup = async () => {
    if (!newGroupName || !client || !wallets[0]) return;
    try {
      // クライアントが準備できているか確認
      if (!client.isReady) {
        throw new Error('XMTPクライアントが準備できていません');
      }

      // アドレスから0xプレフィックスを除去
      const myAddress = wallets[0].address.toLowerCase().replace('0x', '');
      const members = [myAddress];

      console.log('グループ作成を開始します...');
      // グループを作成
      const group = await createGroup(client, newGroupName, members);
      console.log('グループが作成されました:', group);

      const newGroupData: GroupData = {
        id: group.id,
        name: newGroupName,
        group,
        members,
      };
      setGroups((prev) => [...prev, newGroupData]);
      setNewGroupName('');
    } catch (error) {
      console.error('グループの作成に失敗しました:', error);
      // エラーの詳細を表示
      if (error instanceof Error) {
        console.error('エラーの詳細:', error.message);
      }
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup?.group || !newMemberAddress) return;
    try {
      // アドレスから0xプレフィックスを除去
      const normalizedAddress = newMemberAddress.toLowerCase().replace('0x', '');
      await addMember(selectedGroup.group, normalizedAddress);
      const updatedGroups = groups.map((group) => {
        if (group.id === selectedGroup.id) {
          return {
            ...group,
            members: [...group.members, normalizedAddress],
          };
        }
        return group;
      });
      setGroups(updatedGroups);
      setNewMemberAddress('');
    } catch (error) {
      console.error('メンバーの追加に失敗しました:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage || !selectedGroup?.group || !client) return;
    try {
      await sendMessage(selectedGroup.group, newMessage);
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: 'me',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('メッセージの送信に失敗しました:', error);
    }
  };

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Button onClick={login}>ログイン</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <div className="w-64 border-r p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">グループ作成</h2>
          <div className="flex gap-2">
            <Input
              placeholder="グループ名"
              value={newGroupName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewGroupName(e.target.value)
              }
            />
            <Button onClick={handleCreateGroup}>作成</Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`p-2 mb-2 cursor-pointer ${
                selectedGroup?.id === group.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              <h3 className="font-medium">{group.name}</h3>
              <p className="text-sm text-muted-foreground">
                {group.members.length} メンバー
              </p>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* メンバー追加セクション */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-2">メンバー追加</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="メンバーのアドレス"
                  value={newMemberAddress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewMemberAddress(e.target.value)
                  }
                />
                <Button onClick={handleAddMember}>追加</Button>
              </div>
              <div className="mt-2">
                <h3 className="font-medium mb-2">現在のメンバー</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGroup.members.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-2 bg-accent p-2 rounded"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {member.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.slice(0, 6)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* チャットセクション */}
            <div className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'me' ? 'justify-end' : 'justify-start'
                    } mb-4`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="メッセージを入力..."
                    value={newMessage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNewMessage(e.target.value)
                    }
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <Button onClick={handleSendMessage}>送信</Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            グループを選択してください
          </div>
        )}
      </div>
    </div>
  );
}
