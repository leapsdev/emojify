declare module '@privy-io/react-auth' {
  export interface PrivyWallet {
    address: string;
    sign: (message: string) => Promise<string>;
  }

  export interface User {
    id: string;
    wallet: PrivyWallet;
  }

  export interface EthereumProvider {
    request: (args: { 
      method: string; 
      params?: Array<string | number | boolean | Record<string, unknown> | Array<unknown>>; 
    }) => Promise<string | number | boolean | Record<string, unknown> | Array<unknown>>;
  }

  export interface Wallet {
    address: string;
    getEthereumProvider: () => Promise<EthereumProvider>;
  }

  export interface PrivyInterface {
    ready: boolean;
    authenticated: boolean;
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string>;
    wallets: Wallet[];
  }

  export function usePrivy(): PrivyInterface;
}
