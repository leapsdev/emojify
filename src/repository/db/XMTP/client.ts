import { Client, type Signer } from '@xmtp/browser-sdk';
import { ethers } from 'ethers';
import type { providers } from 'ethers';

// XMTPクライアントの初期化
export async function initializeXMTPClient(
  provider: providers.ExternalProvider,
) {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const address = (await signer.getAddress()) as `0x${string}`;

    const xmtpSigner: Signer = {
      type: 'EOA',
      getIdentifier: () => ({
        identifier: address.toLowerCase() as `0x${string}`,
        identifierKind: 'Ethereum',
      }),
      signMessage: async (message: string) => {
        const signature = await signer.signMessage(message);
        return new Uint8Array(Buffer.from(signature.slice(2), 'hex'));
      },
    };

    const client = await Client.create(xmtpSigner, { env: 'production' });
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
