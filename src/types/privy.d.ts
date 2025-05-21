declare module '@privy-io/react-auth' {
  export interface PrivyWallet {
    address: string;
    sign: (message: string) => Promise<string>;
  }

  export interface User {
    id: string;
    wallet: PrivyWallet;
  }

  export interface PrivyInterface {
    ready: boolean;
    authenticated: boolean;
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    getAccessToken: () => Promise<string>;
  }

  export function usePrivy(): PrivyInterface;
}
