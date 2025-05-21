import { useEffect, useState } from 'react';
import type { DecodedMessage, Conversation } from '@xmtp/xmtp-js';
import { useXmtpClient } from './useXmtpClient';

interface Message {
  id: string;
  senderAddress: string;
  content: string;
  sent: boolean;
  timestamp: Date;
}

export function useMessages(peerAddress: string) {
  const { client } = useXmtpClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // 会話を開始または取得
  useEffect(() => {
    const startConversation = async () => {
      if (!client || !peerAddress) return;

      try {
        const conv = await client.conversations.newConversation(peerAddress);
        setConversation(conv);
      } catch (err) {
        console.error('Failed to start conversation:', err);
        setError('Failed to start conversation');
      }
    };

    startConversation();
  }, [client, peerAddress]);

  // メッセージをロード
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation) return;

      try {
        setLoading(true);
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
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversation]);

  // リアルタイムメッセージの購読
  useEffect(() => {
    if (!conversation) return;

    const streamMessages = async () => {
      for await (const msg of await conversation.streamMessages()) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: msg.id,
            senderAddress: msg.senderAddress,
            content: msg.content,
            sent: true,
            timestamp: msg.sent,
          },
        ]);
      }
    };

    streamMessages();
  }, [conversation]);

  // メッセージ送信関数
  const sendMessage = async (content: string) => {
    if (!conversation) throw new Error('Conversation not initialized');

    try {
      await conversation.send(content);
      return true;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw new Error('Failed to send message');
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
