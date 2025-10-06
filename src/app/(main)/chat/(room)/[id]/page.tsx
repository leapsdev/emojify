'use client';

import { ChatRoomPage } from '@/components/pages/ChatRoomPage';
import { Header } from '@/components/shared/layout/Header';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getChatRoomAction } from '@/repository/db/chat/actions';
import type { ChatRoom, Message, User } from '@/repository/db/database';
import { getUser } from '@/repository/db/user/actions';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, walletAddress, user } = useUnifiedAuth();
  const [roomData, setRoomData] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const params = useParams();
  const roomId = params.id as string;

  useEffect(() => {
    const fetchRoomData = async () => {
      console.log('[ChatRoomPage] データ取得開始:', {
        isAuthenticated,
        walletAddress,
        roomId,
        hasFirebaseUser: !!user,
        timestamp: new Date().toISOString(),
      });

      if (isAuthenticated && walletAddress && roomId && user) {
        console.log('[ChatRoomPage] getChatRoomAction呼び出し:', {
          roomId,
        });
        try {
          const { room, messages: roomMessages } =
            await getChatRoomAction(roomId);
          console.log('[ChatRoomPage] データ取得完了:', {
            hasRoom: !!room,
            messagesCount: roomMessages.length,
          });
          if (!room) {
            console.log('[ChatRoomPage] ルームが見つかりません:', { roomId });
            setIsDataLoading(false);
            notFound();
          }
          setRoomData(room);
          setMessages(roomMessages);

          // 他のメンバーのユーザー情報を取得（エラーが発生してもページは表示）
          const otherMemberWalletAddresses = Object.keys(room.members).filter(
            (memberAddress) => memberAddress !== walletAddress,
          );

          try {
            const otherUsersData = await Promise.all(
              otherMemberWalletAddresses.map((memberAddress) =>
                getUser(memberAddress),
              ),
            );

            setOtherUsers(
              otherUsersData.filter((user): user is User => user !== null),
            );
          } catch (userError) {
            console.warn('Failed to fetch user data:', userError);
            // ユーザー情報の取得に失敗してもページは表示
            setOtherUsers([]);
          }

          // データ取得成功時のみローディング終了
          setIsDataLoading(false);
        } catch (error) {
          console.error('[ChatRoomPage] データ取得エラー:', error);
          // エラー時もローディング終了
          setIsDataLoading(false);
        }
      } else {
        console.log('[ChatRoomPage] データ取得スキップ:', {
          isAuthenticated,
          walletAddress,
          roomId,
          hasFirebaseUser: !!user,
        });
        // Firebase認証完了を待つため、ローディング継続（setIsDataLoading(false)を呼ばない）
      }
    };

    fetchRoomData();
  }, [isAuthenticated, walletAddress, roomId, user]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ルームが存在しない場合のみ404エラー
  if (!roomData) {
    notFound();
  }

  // ヘッダーに表示するユーザー名を生成
  const headerTitle = (() => {
    if (otherUsers.length > 0) {
      // ユーザー名が取得できた場合
      return otherUsers.map((user) => user.username).join(', ');
    }
    if (roomData) {
      // ユーザー名が取得できない場合は、ウォレットアドレスを表示
      const otherMemberAddresses = Object.keys(roomData.members).filter(
        (address) => address !== walletAddress,
      );
      return otherMemberAddresses
        .map((address) => `${address.slice(0, 6)}...${address.slice(-4)}`)
        .join(', ');
    }
    return '';
  })();

  return (
    <>
      <Header
        backHref="/chat"
        centerContent={
          <div className="max-w-[320px] w-full text-center">
            <h1 className="font-semibold truncate">{headerTitle}</h1>
          </div>
        }
      />
      <ChatRoomPage
        roomId={roomId}
        walletAddress={walletAddress || ''}
        initialMessages={messages}
      />
    </>
  );
}
