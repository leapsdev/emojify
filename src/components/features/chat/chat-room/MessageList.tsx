'use client';

import type { NFTData } from '@/components/features/explore/types';

import { formatDateToYYYYMMDD } from '@/lib/utils';
import type { Message } from '@/repository/db/database';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { useGlobalNFTs } from './hooks/useGlobalNFTs';
import { useRoomMessages } from './hooks/useRoomMessages';

type MessageListProps = {
  roomId: string;
  currentUserId: string;
  initialMessages: Message[];
};

function MessageListContent({
  roomId,
  currentUserId,
  initialMessages,
}: MessageListProps) {
  const messages = useRoomMessages(roomId, currentUserId, initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { nfts } = useGlobalNFTs();

  // NFTの情報をマップに変換
  const nftMap = nfts.reduce<Record<string, NFTData>>((acc, nft) => {
    if (nft.imageUrl && nft.name) {
      acc[`nft-${nft.tokenId}`] = {
        tokenId: nft.tokenId,
        name: nft.name,
        imageUrl: nft.imageUrl,
        creator: nft.creator,
        details: nft.details,
      };
    }
    return acc;
  }, {});

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
        <p className="text-gray-500">No messages</p>
      </div>
    );
  }

  // 日付でメッセージをグループ化
  const messagesByDate = messages.reduce<Record<string, Message[]>>(
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

  const renderMessageContent = (content: string) => {
    // メッセージをNFTと絵文字に分割
    const parts = content.split(/(nft-\d+)/).filter(Boolean);

    return (
      <div style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
        {parts.map((part, index) => {
          const nftMatch = part.match(/nft-(\d+)/);
          if (nftMatch) {
            const nftId = nftMatch[0];
            const nft = nftMap[nftId];
            if (nft) {
              return (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    width: '1.5em',
                    height: '1.5em',
                    verticalAlign: 'middle',
                    margin: '0',
                  }}
                >
                  <Image
                    src={nft.imageUrl}
                    alt={nft.name}
                    width={96}
                    height={96}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '50%',
                      display: 'block',
                    }}
                    quality={100}
                  />
                </span>
              );
            }
            // NFTが見つからない場合は何も表示しない
            return null;
          }
          // 絵文字も1文字ずつspanでラップし、inline-blockで
          return (
            <React.Fragment key={index}>
              {[...part].map((char, i) => (
                <span
                  key={`${index}-${i}`}
                  className="leading-none text-4xl"
                  style={{
                    display: 'inline-block',
                    width: '1.5em',
                    height: '1.5em',
                    verticalAlign: 'middle',
                    textAlign: 'center',
                    lineHeight: '1.5em',
                    margin: '0',
                  }}
                >
                  {char}
                </span>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {Object.entries(messagesByDate).map(([date, messagesForDate]) => (
        <div key={date}>
          <div className="text-center mb-4">
            <span className="text-sm text-gray-400">{date}</span>
          </div>

          <div className="space-y-4">
            {messagesForDate.map((message) => {
              const isSentByCurrentUser =
                message.senderWalletAddress === currentUserId;

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
                    {renderMessageContent(message.content)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 px-1">
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {message.sent && isSentByCurrentUser && <span>Sent</span>}
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

export function MessageList(props: MessageListProps) {
  return <MessageListContent {...props} />;
}
