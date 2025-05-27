'use client';

import { Client, type IdentifierKind } from '@xmtp/browser-sdk';
import { createContext, useContext, useState, ReactNode } from 'react';
import type { Address } from 'viem';

interface XmtpContextType {
  client: Client | null;
  initialize: (walletClient: any) => Promise<void>;
}

const XmtpContext = createContext<XmtpContextType>({
  client: null,
  initialize: async () => {},
});

export function XmtpProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);

  const initialize = async (walletClient: any) => {
    if (client) return;

    try {
      const address = walletClient.account.address as Address;
      const chainId = await walletClient.getChainId();
      const signer = {
        type: 'EOA' as const,
        getIdentifier: () => ({
          identifierKind: "Ethereum" as IdentifierKind,
          identifier: address.toLowerCase(),
        }),
        signMessage: async (message: string) => {
          const signature = await walletClient.signMessage({
            message,
          });
          return new Uint8Array(Buffer.from(signature.slice(2), 'hex'));
        },
        getChainId: () => BigInt(chainId)
      };

      const xmtp = await Client.create(signer, { 
        env: 'dev',
        dbEncryptionKey: new Uint8Array(32), // 32バイトのダミー暗号化キー
        disableAutoRegister: false
      });
      setClient(xmtp);
    } catch (error) {
      console.error('Error initializing XMTP client:', error);
      throw error;
    }
  };

  return (
    <XmtpContext.Provider value={{ client, initialize }}>
      {children}
    </XmtpContext.Provider>
  );
}

export const useClient = () => useContext(XmtpContext);
