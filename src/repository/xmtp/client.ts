import { Wallet } from 'ethers';
import { Client } from '@xmtp/xmtp-js';
import type { XMTPClient, XMTPClientOptions } from './types';

/**
 * XMTPクライアントのインスタンスを保持
 */
let client: XMTPClient | null = null;

/**
 * XMTPクライアントを初期化する
 */
export async function initializeClient(
  wallet: Wallet,
  options?: XMTPClientOptions
): Promise<XMTPClient> {
  if (client) return client;

  try {
    client = await Client.create(wallet, {
      env: options?.env || 'production'
    });
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
