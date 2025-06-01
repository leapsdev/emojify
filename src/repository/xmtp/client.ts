import type { Identifier, IdentifierKind, Signer } from '@xmtp/browser-sdk';
import { Client } from '@xmtp/browser-sdk';
import type { XMTPClient, XMTPClientOptions } from './types';

/**
 * XMTPクライアントのインスタンスを保持
 */
let client: XMTPClient | null = null;
let currentAddress: string | null = null;

/**
 * XMTPクライアントを初期化する
 */
export async function initializeClient(
  signer: Signer,
  options?: XMTPClientOptions,
): Promise<XMTPClient> {
  const identifierObj = await signer.getIdentifier();
  const addressString =
    typeof identifierObj === 'string'
      ? identifierObj
      : identifierObj.identifier;

  // すでにクライアントが存在し、同じアドレスの場合は再利用
  if (client && currentAddress && currentAddress === addressString) {
    return client;
  }

  try {
    // 新しいクライアントを作成
    client = await Client.create(signer, {
      env: options?.env || 'production',
    });
    currentAddress = addressString;
    return client;
  } catch (error) {
    console.error('Failed to initialize XMTP client:', error);
    throw new Error('XMTPクライアントの初期化に失敗しました');
  }
}

/**
 * 現在のXMTPクライアントを取得
 */
export function getClient(): XMTPClient {
  if (!client) {
    throw new Error('XMTPクライアントが初期化されていません');
  }
  return client;
}

/**
 * XMTPがウォレットアドレスに対して有効かどうかを確認
 */
export async function isXMTPEnabled(address: string): Promise<boolean> {
  if (!client) {
    throw new Error('XMTPクライアントが初期化されていません');
  }

  try {
    // アドレスの形式を正規化（0xプリフィックスを確保）
    const normalizedAddress = address.startsWith('0x')
      ? address.toLowerCase()
      : `0x${address.toLowerCase()}`;

    console.log('Checking XMTP for normalized address:', normalizedAddress);

    // 正しいIdentifier構造を使用
    const identifier: Identifier = {
      identifier: normalizedAddress,
      identifierKind: 'Ethereum' as IdentifierKind,
    };

    const result = await client.canMessage([identifier]);
    return result.get(identifier.identifier) || false;
  } catch (error) {
    console.error('Failed to check XMTP status:', error);
    return false;
  }
}
