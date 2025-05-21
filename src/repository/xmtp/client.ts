import { Client } from '@xmtp/xmtp-js';
import { type Signer } from '@ethersproject/abstract-signer';
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
  options?: XMTPClientOptions
): Promise<XMTPClient> {
  const address = await signer.getAddress();

  // すでにクライアントが存在し、同じアドレスの場合は再利用
  if (client && currentAddress === address) {
    return client;
  }

  try {
    // 新しいクライアントを作成
    client = await Client.create(signer, {
      env: options?.env || 'production'
    });
    currentAddress = address;
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
    return await Client.canMessage(address);
  } catch (error) {
    console.error('Failed to check XMTP status:', error);
    return false;
  }
}
