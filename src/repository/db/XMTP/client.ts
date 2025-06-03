import type { Wallet } from '@privy-io/react-auth';
import { Client, type Signer } from '@xmtp/browser-sdk';
import { ethers } from 'ethers';
import type { providers } from 'ethers';

interface PrivyWallet extends Wallet {
  provider: providers.ExternalProvider;
}

// XMTPクライアントの初期化
export async function initializeXMTPClient(
  wallet: PrivyWallet,
): Promise<Client> {
  try {
    const provider = new ethers.providers.Web3Provider(wallet.provider);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // SCW signerの作成
    const xmtpSigner: Signer = {
      type: 'SCW',
      getIdentifier: () => ({
        identifier: address.toLowerCase() as `0x${string}`,
        identifierKind: 'Ethereum',
      }),
      signMessage: async (message: string) => {
        const signature = await signer.signMessage(message);
        return new Uint8Array(Buffer.from(signature.slice(2), 'hex'));
      },
      getChainId: () => {
        return BigInt(1); // Ethereum mainnet
      },
    };

    // データベース暗号化キーの生成
    const dbEncryptionKey = window.crypto.getRandomValues(new Uint8Array(32));

    // クライアントの作成
    const client = await Client.create(xmtpSigner, {
      env: 'dev',
      dbEncryptionKey,
    });

    return client;
  } catch (error) {
    console.error('XMTPクライアントの初期化に失敗しました:', error);
    throw error;
  }
}

// 会話一覧の取得
export async function listConversations(client: Client) {
  try {
    const conversations = await client.conversations.list();
    return conversations;
  } catch (error) {
    console.error('会話一覧の取得に失敗しました:', error);
    throw error;
  }
}
