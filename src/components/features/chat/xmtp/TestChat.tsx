'use client';

import { usePrivy } from '@privy-io/react-auth';
import {
  Client,
  type DecodedMessage,
  type Dm,
  type Identifier,
  type IdentifierKind,
  type Group as XMTPGroup,
} from '@xmtp/browser-sdk';
import { useCallback, useEffect, useState } from 'react';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';
import { useViemWallet } from './hooks/useViemWallet';

// 型安全なメッセージ型定義
type Message = {
  id: string;
  senderAddress: string;
  content: string;
  sent: boolean;
  timestamp: Date;
};

// XMTP SDKの実際の型に合わせて調整
type SafeConversation = Dm<unknown> | XMTPGroup<unknown>;

type ConversationWithMessages = {
  conversation: SafeConversation;
  messages: Message[];
  key: string;
};

let xmtpClient: Client | null = null;

export function TestChat() {
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const { ready, authenticated, login } = usePrivy();
  const { address } = useAccount();
  const { signMessage: viemSignMessage } = useViemWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isXMTPReady, setIsXMTPReady] = useState(false);
  const [conversations, setConversations] = useState<
    ConversationWithMessages[]
  >([]);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<
    number | null
  >(null);

  const initializeClient = useCallback(async () => {
    if (!address || !viemSignMessage) return;

    try {
      setLoading(true);
      setError(null);

      if (xmtpClient) {
        setClient(xmtpClient);
        setIsXMTPReady(true);
        return;
      }

      // XMTP Signerインターフェースの実装
      const signer = {
        type: 'EOA' as const, // SCWからEOAに変更（viemはEOAアカウントと同様に動作）
        getIdentifier: async (): Promise<Identifier> => {
          // XMTP v2.1.0の正しいIdentifier構造
          console.log('Getting identifier for address:', address);

          if (!address) {
            throw new Error('アドレスが利用できません');
          }

          // アドレスの形式を厳密に正規化
          let normalizedAddress = address.trim().toLowerCase();

          // 既存の0xプリフィックスを削除してから再追加（重複防止）
          if (normalizedAddress.startsWith('0x')) {
            normalizedAddress = normalizedAddress.slice(2);
          }

          // 有効な16進数文字列かチェック
          if (!/^[0-9a-f]{40}$/.test(normalizedAddress)) {
            throw new Error(`無効なEthereumアドレス形式: ${address}`);
          }

          // 0xプリフィックスを追加
          normalizedAddress = `0x${normalizedAddress}`;

          console.log('Normalized address:', normalizedAddress);
          console.log('Address validation:', {
            original: address,
            cleaned: normalizedAddress,
            length: normalizedAddress.length,
            isValid: /^0x[0-9a-f]{40}$/.test(normalizedAddress),
          });

          return {
            identifier: normalizedAddress,
            identifierKind: 'Ethereum' as IdentifierKind,
          };
        },
        signMessage: async (
          message: string | Uint8Array,
        ): Promise<Uint8Array> => {
          try {
            const messageString =
              typeof message === 'string'
                ? message
                : new TextDecoder().decode(message);

            if (!viemSignMessage) {
              throw new Error('Viem sign message function not available');
            }

            console.log(
              'Signing message:',
              messageString.substring(0, 100) + '...',
            );
            console.log('Message length:', messageString.length);
            console.log('Message type:', typeof messageString);

            // viemSignMessage関数でHex署名を取得
            const hexSignature = await viemSignMessage(address, messageString);
            console.log('Received hex signature:', hexSignature);
            console.log('Signature type:', typeof hexSignature);
            console.log('Signature length:', hexSignature.length);

            // 署名が有効なhex文字列かチェック
            if (!hexSignature || typeof hexSignature !== 'string') {
              throw new Error(
                '無効な署名形式: 署名がnullまたは文字列ではありません',
              );
            }

            // Hex文字列をUint8Arrayに変換（0xプリフィックスを除去）
            const cleanHex = hexSignature.startsWith('0x')
              ? hexSignature.slice(2)
              : hexSignature;
            console.log('Clean hex:', cleanHex);
            console.log('Clean hex length:', cleanHex.length);

            // 署名の長さ検証（通常65バイトまたは64バイト）
            if (cleanHex.length !== 130 && cleanHex.length !== 128) {
              console.warn(
                '警告: 予期しない署名長:',
                cleanHex.length,
                '文字 (期待値: 128または130文字)',
              );

              // 短すぎる場合はエラー
              if (cleanHex.length < 64) {
                throw new Error(
                  `署名が短すぎます: ${cleanHex.length}文字 (最低64文字必要)`,
                );
              }
            }

            // Hex文字列が有効な16進数かチェック
            if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
              throw new Error('無効な16進数署名');
            }

            // Hex文字列をバイト配列に変換
            const signatureBytes = new Uint8Array(cleanHex.length / 2);
            for (let i = 0; i < cleanHex.length; i += 2) {
              signatureBytes[i / 2] = Number.parseInt(
                cleanHex.substr(i, 2),
                16,
              );
            }

            console.log(
              'Converted signature bytes length:',
              signatureBytes.length,
            );
            console.log(
              'First 10 bytes:',
              Array.from(signatureBytes.slice(0, 10))
                .map((b) => '0x' + b.toString(16).padStart(2, '0'))
                .join(', '),
            );

            // XMTP SDK が期待する署名長をチェック
            if (signatureBytes.length < 32) {
              throw new Error(
                `署名バイト数が不足: ${signatureBytes.length}バイト (最低32バイト必要)`,
              );
            }

            return signatureBytes;
          } catch (error) {
            console.error('署名処理エラー詳細:', {
              error,
              errorMessage:
                error instanceof Error ? error.message : String(error),
              errorType: typeof error,
              errorStack: error instanceof Error ? error.stack : undefined,
            });

            // 特定のエラータイプに基づいた詳細なエラーメッセージ
            if (error instanceof Error) {
              if (error.message.includes('signature length')) {
                throw new Error(
                  `スマートコントラクト署名エラー (長さ): ${error.message}`,
                );
              } else if (error.message.includes('User rejected')) {
                throw new Error('ユーザーによって署名がキャンセルされました');
              } else if (error.message.includes('Viem')) {
                throw new Error(`Viem署名エラー: ${error.message}`);
              } else {
                throw new Error(`署名に失敗しました: ${error.message}`);
              }
            } else {
              throw new Error(`署名に失敗しました: ${String(error)}`);
            }
          }
        },
        getChainId: (): bigint => {
          // Base MainnetのチェーンID - bigintで返す
          return BigInt(8453);
        },
      };

      console.log('Creating XMTP client with signer type:', signer.type);
      console.log('Chain ID:', signer.getChainId());

      const newClient = await Client.create(signer, {
        env: 'dev',
        codecs: [],
        dbEncryptionKey: undefined, // v2.0.0形式：optionsに含める
      });

      console.log('XMTP クライアントが正常に作成されました');
      xmtpClient = newClient;
      setClient(newClient);
      setIsXMTPReady(true);

      // 既存の会話をロード
      try {
        await loadConversations(newClient);
        console.log('既存の会話の読み込みが完了しました');
      } catch (loadErr) {
        console.warn(
          '既存の会話の読み込みに失敗しましたが、クライアントは利用可能です:',
          loadErr,
        );
        // 会話の読み込みが失敗してもクライアントは使用可能な状態を維持
      }
    } catch (err) {
      console.error('XMTP初期化エラー:', err);

      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorLower = errorMessage.toLowerCase();

      let userFriendlyMessage = '❌ XMTP初期化に失敗しました';

      if (
        errorMessage.includes('InboxValidationFailed') ||
        errorLower.includes('inbox validation')
      ) {
        userFriendlyMessage =
          '🚫 XMTP Inbox検証に失敗しました。以下を試してください:\n' +
          '• ウォレットを再接続\n' +
          '• 別のブラウザでの試行\n' +
          '• しばらく時間をおいて再試行';
      } else if (
        errorMessage.includes('Smart contract wallet signature is invalid') ||
        errorMessage.includes('invalid signature length') ||
        errorMessage.includes('Signature validation failed')
      ) {
        userFriendlyMessage =
          '🔐 スマートコントラクトウォレット署名エラーが発生しました。以下を試してください:\n' +
          '• ウォレットアプリで署名を再度承認\n' +
          '• ウォレットを一度切断して再接続\n' +
          '• 別のウォレットまたはEOAアカウントでの試行\n' +
          '• ブラウザを再起動して再試行';
      } else if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorLower.includes('connection')
      ) {
        userFriendlyMessage =
          '🌐 ネットワーク接続エラーが発生しました。以下を確認してください:\n' +
          '• インターネット接続\n' +
          '• ファイアウォール設定\n' +
          '• VPN接続';
      } else if (
        errorMessage.includes('signature') ||
        errorMessage.includes('sign') ||
        errorLower.includes('denied')
      ) {
        userFriendlyMessage =
          '✍️ ウォレット署名に失敗しました。以下を試してください:\n' +
          '• ウォレットで署名を承認\n' +
          '• ウォレットを再接続\n' +
          '• ブラウザを再起動';
      } else if (
        errorMessage.includes('timeout') ||
        errorLower.includes('timeout')
      ) {
        userFriendlyMessage =
          '⏰ タイムアウトが発生しました。ネットワーク接続を確認して再試行してください。';
      } else if (
        errorMessage.includes('Invalid') ||
        errorLower.includes('invalid')
      ) {
        userFriendlyMessage =
          '⚠️ 無効な設定です。ウォレット接続を確認してください。';
      } else {
        userFriendlyMessage = `❌ XMTP初期化エラー: ${errorMessage}`;
      }

      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [address, viemSignMessage]);

  const loadConversations = useCallback(async (xmtpClient: Client) => {
    try {
      // XMTP Browser SDK v2.1.0の最新仕様 - Group/Dmインスタンスを返す
      const conversationList = await xmtpClient.conversations.list();
      const conversationsWithMessages: ConversationWithMessages[] = [];
      const usedKeys = new Set<string>();

      console.log(`読み込み中の会話数: ${conversationList.length}`);

      for (let index = 0; index < conversationList.length; index++) {
        const conversation = conversationList[index];

        // v2.1.0では会話はGroupまたはDmのインスタンス
        const conversationType = conversation.constructor.name; // 'Group' または 'Dm'

        console.log(
          `会話 ${index + 1}: タイプ=${conversationType}, ID=${conversation.id}`,
        );

        // 一意性を保証するための処理
        let key = conversation.id || `conversation_${Date.now()}_${index}`;
        let counter = 1;

        while (usedKeys.has(key)) {
          key = `${conversation.id}_${counter}`;
          counter++;
        }

        usedKeys.add(key);
        const messages = await loadMessages(conversation as SafeConversation);

        conversationsWithMessages.push({
          conversation: conversation as SafeConversation,
          messages,
          key,
        });
      }

      setConversations(conversationsWithMessages);
      console.log(
        `✅ ${conversationsWithMessages.length}件の会話を正常に読み込みました`,
      );
    } catch (err) {
      console.error('会話の読み込みエラー:', err);
    }
  }, []);

  const loadMessages = async (
    conversation: SafeConversation,
  ): Promise<Message[]> => {
    try {
      // XMTP Browser SDK v2.1.0 - conversation.messages()は最新のメッセージ取得メソッド
      const messageList = await conversation.messages();

      console.log(
        `会話 ${conversation.id} から ${messageList.length}件のメッセージを読み込み`,
      );

      return messageList.map((msg: DecodedMessage<unknown>) => ({
        id: msg.id,
        senderAddress: msg.senderInboxId,
        content:
          typeof msg.content === 'string'
            ? msg.content
            : String(msg.content || ''),
        sent: msg.senderInboxId === address,
        timestamp: new Date(Number(msg.sentAtNs) / 1000000),
      }));
    } catch (err) {
      console.error('メッセージの読み込みエラー:', err);
      return [];
    }
  };

  // カスタムアドレス検証関数
  const isValidEthereumAddress = (address: string): boolean => {
    const trimmed = address.trim().toLowerCase();

    // 空文字チェック
    if (!trimmed) {
      return false;
    }

    // アドレス長の基本チェック
    if (trimmed.length !== 42 && trimmed.length !== 40) {
      return false;
    }

    // 0xプリフィックスを正規化
    let cleanAddress = trimmed;
    if (cleanAddress.startsWith('0x')) {
      cleanAddress = cleanAddress.slice(2);
    }

    // 40文字の16進数かチェック
    if (cleanAddress.length !== 40 || !/^[0-9a-f]{40}$/.test(cleanAddress)) {
      return false;
    }

    // 最終的な正規化されたアドレス
    const finalAddress = `0x${cleanAddress}`;

    // viemのisAddressも併用してチェック
    try {
      return isAddress(finalAddress);
    } catch {
      // isAddressが失敗した場合でも、正規表現でのチェックが通れば有効とする
      return /^0x[0-9a-f]{40}$/.test(finalAddress);
    }
  };

  const startConversation = async () => {
    if (!client || !recipientAddress) return;

    try {
      setLoading(true);
      setError(null);

      // アドレスの検証 - デバッグ情報を追加
      const trimmedAddress = recipientAddress.trim();
      console.log('検証中のアドレス:', {
        original: recipientAddress,
        trimmed: trimmedAddress,
        length: trimmedAddress.length,
        isValidByViem: isAddress(trimmedAddress),
        isValidByCustom: isValidEthereumAddress(trimmedAddress),
        regexTest: /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress),
      });

      if (!isValidEthereumAddress(trimmedAddress)) {
        throw new Error(
          `有効なEthereumアドレスを入力してください。入力値: "${trimmedAddress}"`,
        );
      }

      // メッセージ送信が可能かチェック - XMTP Browser SDK v2.1.0仕様
      console.log('Checking if can message with v2.1.0 API:', trimmedAddress);

      // アドレスの形式を厳密に正規化（重複プリフィックス防止）
      let normalizedAddress = trimmedAddress.toLowerCase();

      // 既存の0xプリフィックスを削除してから再追加
      if (normalizedAddress.startsWith('0x')) {
        normalizedAddress = normalizedAddress.slice(2);
      }

      // 有効な16進数文字列かチェック
      if (!/^[0-9a-f]{40}$/.test(normalizedAddress)) {
        throw new Error(`無効なEthereumアドレス形式: ${trimmedAddress}`);
      }

      // 0xプリフィックスを追加
      normalizedAddress = `0x${normalizedAddress}`;

      console.log('Normalized recipient address:', normalizedAddress);
      console.log('Address normalization check:', {
        original: trimmedAddress,
        cleaned: normalizedAddress,
        length: normalizedAddress.length,
        isValid: /^0x[0-9a-f]{40}$/.test(normalizedAddress),
      });

      // v2.1.0でのcanMessageチェック - 正規化されたアドレスで直接チェック
      const recipientIdentifier: Identifier = {
        identifier: normalizedAddress,
        identifierKind: 'Ethereum',
      };
      const canMessageMap = await client.canMessage([recipientIdentifier]);
      const canMessage = canMessageMap.get(normalizedAddress) || false;

      console.log('Can message result (v2.1.0):', {
        address: normalizedAddress,
        canMessage,
        mapSize: canMessageMap.size,
        allEntries: Array.from(canMessageMap.entries()),
      });

      if (!canMessage) {
        throw new Error('このアドレスにはメッセージを送信できません');
      }

      // 会話を開始 - XMTP Browser SDK v2.1.0仕様に従ったDM作成
      console.log('Creating DM conversation with inbox ID:', normalizedAddress);

      // まず既存のDMがあるかチェック
      const existingDm =
        await client.conversations.getDmByInboxId(normalizedAddress);
      let dmConversation: SafeConversation;

      if (existingDm) {
        console.log('既存のDM会話を使用:', existingDm.id);
        dmConversation = existingDm as SafeConversation;
      } else {
        console.log('新しいDM会話を作成中...');
        // 新しいDMを作成 - v2.1.0形式
        dmConversation = (await client.conversations.newDm(
          normalizedAddress,
        )) as SafeConversation;
        console.log('新しいDM会話を作成:', dmConversation.id);
      }

      // 新しい会話を追加
      const messages = await loadMessages(dmConversation as SafeConversation);
      const conversationId =
        'id' in dmConversation
          ? dmConversation.id
          : `dm_${trimmedAddress.toLowerCase()}_${Date.now()}`;
      const newConversationWithMessages: ConversationWithMessages = {
        conversation: dmConversation as SafeConversation,
        messages,
        key: conversationId,
      };

      setConversations((prev) => {
        // 既存の会話で同じkeyが存在しないかチェック
        const existingKeys = prev.map((conv) => conv.key);
        let finalKey = conversationId;
        let counter = 1;

        while (existingKeys.includes(finalKey)) {
          finalKey = `${conversationId}_${counter}`;
          counter++;
        }

        return [...prev, { ...newConversationWithMessages, key: finalKey }];
      });
      setRecipientAddress('');

      // 新しく作成した会話を自動選択
      setSelectedConversationIndex(conversations.length);
    } catch (err) {
      console.error('会話開始エラー:', err);
      setError(err instanceof Error ? err.message : '会話の開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationIndex: number, retryCount = 0) => {
    if (
      !client ||
      !messageContent ||
      conversationIndex < 0 ||
      conversationIndex >= conversations.length
    )
      return;

    const maxRetries = 2; // InboxValidationFailedエラーのため回数を減らす
    const retryDelay = 2000 * (retryCount + 1); // より長い遅延時間

    try {
      setLoading(true);
      setError(null);

      const conversationWithMessages = conversations[conversationIndex];

      console.log(`メッセージ送信試行 ${retryCount + 1}/${maxRetries + 1}:`, {
        conversationKey: conversationWithMessages.key,
        messageContent,
        conversationType:
          conversationWithMessages.conversation.constructor.name,
      });

      // XMTP Browser SDK v2.1.0の最新仕様に従ったメッセージ送信
      const sendResult =
        await conversationWithMessages.conversation.send(messageContent);

      console.log('メッセージ送信結果:', {
        result: sendResult,
        messageId: sendResult || 'no-id-returned',
        conversationId:
          conversationWithMessages.conversation.id || 'no-conversation-id',
      });

      // メッセージを再読み込み
      const updatedMessages = await loadMessages(
        conversationWithMessages.conversation,
      );
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex] = {
        ...conversationWithMessages,
        messages: updatedMessages,
      };
      setConversations(updatedConversations);
      setMessageContent('');

      console.log('✅ メッセージ送信成功 - SDK v2.1.0');
    } catch (err) {
      console.error(`メッセージ送信エラー (試行 ${retryCount + 1}):`, err);

      // エラーの詳細な分析とログ
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;

      console.error('詳細なエラー情報:', {
        message: errorMessage,
        stack: errorStack,
        retryAttempt: retryCount + 1,
        conversationIndex,
        messageContent: messageContent.substring(0, 50) + '...',
      });

      // 特定エラーパターンの検出（大文字小文字を区別しない）
      const errorLower = errorMessage.toLowerCase();

      // 偽陽性の同期成功メッセージを検出（これらは実際にはエラーではない）
      const isFalsePositiveSyncError = (() => {
        // "synced X messages, Y failed Z succeeded" パターンで成功を検出
        const syncPattern =
          /synced\s+(\d+)\s+messages,\s+(\d+)\s+failed\s+(\d+)\s+succeeded/i;
        const syncMatch = syncPattern.exec(errorMessage);

        if (syncMatch) {
          const totalMessages = Number.parseInt(syncMatch[1], 10);
          const failedCount = Number.parseInt(syncMatch[2], 10);
          const succeededCount = Number.parseInt(syncMatch[3], 10);

          // 失敗が0で成功があれば、これは成功メッセージ
          if (failedCount === 0 && succeededCount > 0) {
            console.log('🎉 偽陽性同期エラーを検出: 実際には成功メッセージ', {
              errorMessage,
              total: totalMessages,
              failed: failedCount,
              succeeded: succeededCount,
            });
            return true;
          }
        }

        // "from cursor Some(数字)" パターンの成功メッセージ
        const cursorSuccessPattern = /from\s+cursor\s+Some\(\d+\)/i;
        if (cursorSuccessPattern.test(errorMessage)) {
          console.log('🎉 カーソルベースの成功メッセージを検出', errorMessage);
          return true;
        }

        // より包括的な成功パターンチェック
        const hasSucceeded = errorMessage.includes('succeeded');
        const hasSync = errorMessage.includes('synced');
        const hasMessages = errorMessage.includes('messages');
        const hasZeroFailed = /0\s+failed/i.test(errorMessage);

        // synced + messages + succeeded + 0 failed = 成功
        if (hasSync && hasMessages && hasSucceeded && hasZeroFailed) {
          console.log('🎉 包括的同期成功メッセージを検出', errorMessage);
          return true;
        }

        return false;
      })();

      // XMTP MLS内部エラーを検出（これらは通常無視できる）
      const isMLSInternalError = (() => {
        // key_package_cleaner_workerエラー
        if (
          errorMessage.includes('key_package_cleaner_worker') &&
          errorMessage.includes('Record not found')
        ) {
          console.log(
            '🔧 XMTP MLS内部エラーを検出: key_package_cleaner_worker',
            errorMessage,
          );
          return true;
        }

        // sync worker errorでRecord not found
        if (
          errorMessage.includes('sync worker error') &&
          errorMessage.includes('storage error') &&
          errorMessage.includes('Record not found')
        ) {
          console.log(
            '🔧 XMTP MLS内部エラーを検出: sync worker storage',
            errorMessage,
          );
          return true;
        }

        // inbox_id関連のRecord not foundエラー
        if (
          errorMessage.includes('inbox_id=') &&
          errorMessage.includes('installation_id=') &&
          errorMessage.includes('Record not found')
        ) {
          console.log(
            '🔧 XMTP MLS内部エラーを検出: inbox/installation record',
            errorMessage,
          );
          return true;
        }

        return false;
      })();

      // 偽陽性の場合は成功として処理
      if (isFalsePositiveSyncError) {
        console.log('✅ 偽陽性同期エラーを成功として処理します');

        // メッセージを再読み込みして最新状態を取得
        try {
          const conversationWithMessages = conversations[conversationIndex];
          const updatedMessages = await loadMessages(
            conversationWithMessages.conversation,
          );
          const updatedConversations = [...conversations];
          updatedConversations[conversationIndex] = {
            ...conversationWithMessages,
            messages: updatedMessages,
          };
          setConversations(updatedConversations);
          setMessageContent('');
          console.log('✅ 偽陽性エラー処理: メッセージ送信成功');
          return; // 正常終了
        } catch (reloadErr) {
          console.warn('⚠️ メッセージ再読み込み中にエラー:', reloadErr);
          // 再読み込みに失敗してもメッセージはクリア
          setMessageContent('');
          return; // 正常終了
        }
      }

      // MLS内部エラーの場合は警告レベルで処理（成功扱い）
      if (isMLSInternalError) {
        console.warn(
          '⚠️ XMTP MLS内部エラーを検出しましたが、メッセージ送信は継続します',
        );

        // メッセージを再読み込みして最新状態を取得
        try {
          const conversationWithMessages = conversations[conversationIndex];
          const updatedMessages = await loadMessages(
            conversationWithMessages.conversation,
          );
          const updatedConversations = [...conversations];
          updatedConversations[conversationIndex] = {
            ...conversationWithMessages,
            messages: updatedMessages,
          };
          setConversations(updatedConversations);
          setMessageContent('');
          console.log('✅ MLS内部エラー処理: メッセージ送信継続');
          return; // 正常終了
        } catch (reloadErr) {
          console.warn('⚠️ メッセージ再読み込み中にエラー:', reloadErr);
          // 再読み込みに失敗してもメッセージはクリア
          setMessageContent('');
          return; // 正常終了
        }
      }

      // InboxValidationFailed - 致命的エラー
      const isInboxValidationError =
        errorMessage.includes('InboxValidationFailed') ||
        (errorLower.includes('inbox') && errorLower.includes('validation'));

      // Intent ID関連のエラー - 特定IDのエラー
      const isIntentIdError =
        errorMessage.includes('Intent id ') &&
        (errorMessage.includes('failed') || errorMessage.includes('error'));

      // Intent状態エラー - エラー状態に移行したIntent
      const isIntentStateError =
        errorMessage.includes('since it is in state Error') ||
        errorLower.includes('state error');

      // MLS同期関連エラー（回復可能）
      const isMLSSyncError =
        errorMessage.includes('sync_with_conn') ||
        errorMessage.includes('mls_sync') ||
        (errorLower.includes('sync') && errorLower.includes('conn'));

      // 一般的なMLS関連エラー（偽陽性と内部エラーを除外）
      const isMLSError =
        (errorMessage.includes('Intent') ||
          errorMessage.includes('synced') ||
          errorMessage.includes('cursor') ||
          errorLower.includes('mls') ||
          isMLSSyncError) &&
        !isFalsePositiveSyncError &&
        !isMLSInternalError;

      // 回復不可能なエラーの処理
      if (isInboxValidationError) {
        console.error('❌ InboxValidationFailed - 致命的エラー、リトライ不可');
        setError(
          '🚫 XMTP Inbox検証に失敗しました。ウォレットを再接続するか、ページを再読み込みしてください。',
        );
        return;
      }

      if (isIntentIdError) {
        console.error('❌ Intent ID Error - 特定Intent失敗、リトライ不可');
        setError(
          '🚫 メッセージ処理でエラーが発生しました。新しい会話を開始してください。',
        );
        return;
      }

      if (isIntentStateError) {
        console.error('❌ Intent State Error - Intent状態エラー、リトライ不可');
        setError(
          '🚫 メッセージがエラー状態になりました。会話を再読み込みするか、新しい会話を開始してください。',
        );
        return;
      }

      // 回復可能なMLSエラーのリトライ処理
      if ((isMLSError || isMLSSyncError) && retryCount < maxRetries) {
        console.log(
          `🔄 MLS同期エラー検出。${retryDelay}ms後にリトライします...`,
        );
        setError(
          `⏳ XMTP同期中です。${retryDelay / 1000}秒後に再試行します... (${retryCount + 1}/${maxRetries})`,
        );

        setTimeout(() => {
          sendMessage(conversationIndex, retryCount + 1);
        }, retryDelay);
        return;
      }

      // 最終的なエラー処理
      let finalErrorMessage = '❌ メッセージの送信に失敗しました';

      if (isMLSError || isMLSSyncError) {
        finalErrorMessage =
          '🚫 XMTP MLS同期エラーが継続しています。以下を試してください:\n' +
          '• 会話を再読み込み 🔄\n' +
          '• 新しい会話を開始\n' +
          '• ページを再読み込み';
      } else if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch')
      ) {
        finalErrorMessage =
          '🌐 ネットワークエラーが発生しました。インターネット接続を確認してください。';
      } else if (errorMessage.includes('timeout')) {
        finalErrorMessage =
          '⏰ タイムアウトが発生しました。再試行してください。';
      } else {
        finalErrorMessage = `❌ 送信エラー: ${errorMessage}`;
      }

      setError(finalErrorMessage);
    } finally {
      if (retryCount === 0 || retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  // 選択した会話にメッセージを送信する関数
  const sendMessageToSelected = async () => {
    if (selectedConversationIndex !== null) {
      await sendMessage(selectedConversationIndex);
    }
  };

  // 会話を再同期する関数
  const refreshConversation = async (conversationIndex: number) => {
    if (
      !client ||
      conversationIndex < 0 ||
      conversationIndex >= conversations.length
    ) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('会話を再同期中...');
      const conversationWithMessages = conversations[conversationIndex];

      // メッセージを再読み込み
      const updatedMessages = await loadMessages(
        conversationWithMessages.conversation,
      );
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex] = {
        ...conversationWithMessages,
        messages: updatedMessages,
      };
      setConversations(updatedConversations);

      console.log('会話の再同期が完了しました');
    } catch (err) {
      console.error('会話の再同期エラー:', err);
      setError('会話の再同期に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 全ての会話を再読み込みする関数
  const refreshAllConversations = async () => {
    if (!client) return;

    try {
      setLoading(true);
      setError(null);
      console.log('全ての会話を再読み込み中...');
      await loadConversations(client);
      console.log('全ての会話の再読み込みが完了しました');
    } catch (err) {
      console.error('会話の再読み込みエラー:', err);
      setError('会話の再読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 会話の表示名を取得する関数
  const getConversationDisplayName = (
    conversation: SafeConversation,
    key: string,
  ) => {
    if ('id' in conversation) {
      return `DM - ${conversation.id.slice(0, 8)}...`;
    }
    if ('topic' in conversation) {
      const topic = (conversation as { topic: string }).topic;
      return `Chat - ${topic.slice(0, 8)}...`;
    }
    return `Conversation - ${key.slice(0, 8)}...`;
  };

  useEffect(() => {
    if (
      ready &&
      authenticated &&
      address &&
      typeof viemSignMessage === 'function'
    ) {
      initializeClient();
    }
  }, [ready, authenticated, address, viemSignMessage, initializeClient]);

  if (!ready || !authenticated) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">XMTP Chat</h2>
        <button
          type="button"
          onClick={login}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ログイン
        </button>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">XMTP Chat</h2>
        <p>ウォレットを接続してください</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* サイドバー */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">XMTP Chat</h2>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              アドレス: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            <p className={`${isXMTPReady ? 'text-green-600' : 'text-red-600'}`}>
              {isXMTPReady ? '接続済み' : '未接続'}
            </p>
          </div>
        </div>

        {/* XMTP初期化ボタン */}
        {!isXMTPReady && (
          <div className="p-4">
            <button
              type="button"
              onClick={initializeClient}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'XMTP初期化中...' : 'XMTPを初期化'}
            </button>
          </div>
        )}

        {/* 新しい会話作成 */}
        {isXMTPReady && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold mb-2">新しい会話</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="受信者のアドレス (0x...)"
                className={`w-full px-3 py-2 text-sm border rounded ${
                  recipientAddress &&
                  !isValidEthereumAddress(recipientAddress.trim())
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {recipientAddress &&
                !isValidEthereumAddress(recipientAddress.trim()) && (
                  <p className="text-xs text-red-600">
                    有効なEthereumアドレスを入力してください（0x +
                    40桁の16進数）
                  </p>
                )}
              <button
                type="button"
                onClick={startConversation}
                disabled={
                  loading ||
                  !recipientAddress ||
                  !isValidEthereumAddress(recipientAddress.trim())
                }
                className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '開始中...' : '会話開始'}
              </button>
            </div>
          </div>
        )}

        {/* 会話一覧 */}
        {isXMTPReady && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-sm font-semibold">会話一覧</h3>
              <button
                type="button"
                onClick={refreshAllConversations}
                disabled={loading}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                title="会話を再読み込み"
              >
                🔄
              </button>
            </div>
            <div className="space-y-1">
              {conversations.map((conversationWithMessages, index) => (
                <button
                  key={conversationWithMessages.key}
                  onClick={() => setSelectedConversationIndex(index)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-l-4 transition-colors ${
                    selectedConversationIndex === index
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {getConversationDisplayName(
                      conversationWithMessages.conversation,
                      conversationWithMessages.key,
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {conversationWithMessages.messages.length > 0
                      ? conversationWithMessages.messages[
                          conversationWithMessages.messages.length - 1
                        ].content.slice(0, 30) + '...'
                      : 'メッセージなし'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {conversationWithMessages.messages.length} メッセージ
                  </div>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  会話がありません
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col">
        {/* エラー表示 */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-800">
            <div className="flex items-start space-x-2">
              <div className="text-red-500 text-lg">⚠️</div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">
                  エラーが発生しました
                </div>
                <div className="text-sm whitespace-pre-line">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="p-3 bg-blue-50 border-b border-blue-200 text-blue-800 text-sm">
            <div className="flex items-center space-x-2">
              <div className="animate-spin">🔄</div>
              <span>処理中...</span>
            </div>
          </div>
        )}

        {!isXMTPReady ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                XMTPに接続してください
              </h3>
              <p className="text-gray-500">
                チャットを始めるにはXMTPクライアントを初期化する必要があります
              </p>
            </div>
          </div>
        ) : selectedConversationIndex === null ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                会話を選択してください
              </h3>
              <p className="text-gray-500">
                左のサイドバーから会話を選択するか、新しい会話を開始してください
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 選択した会話のヘッダー */}
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">
                {getConversationDisplayName(
                  conversations[selectedConversationIndex].conversation,
                  conversations[selectedConversationIndex].key,
                )}
              </h3>
              <button
                type="button"
                onClick={() => refreshConversation(selectedConversationIndex!)}
                disabled={loading}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                title="この会話を再同期"
              >
                🔄
              </button>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversations[selectedConversationIndex].messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${msg.sent ? 'text-blue-100' : 'text-gray-500'}`}
                    >
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {conversations[selectedConversationIndex].messages.length ===
                0 && (
                <div className="text-center text-gray-500 py-8">
                  まだメッセージがありません
                </div>
              )}
            </div>

            {/* メッセージ入力エリア */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && !e.shiftKey && sendMessageToSelected()
                  }
                />
                <button
                  type="button"
                  onClick={sendMessageToSelected}
                  disabled={loading || !messageContent}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  送信
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
