declare module '@privy-io/react-auth' {
  export interface PrivyWallet {
    address: string;
    signMessage: (message: string) => Promise<string>;
  }

  export interface Email {
    address: string;
    verified: boolean;
  }

  export interface User {
    id: string;
    wallet: PrivyWallet;
    email?: Email;
  }

  export interface TypedData {
    types: Record<string, Array<{ name: string; type: string }>>;
    primaryType: string;
    domain: Record<string, string | number>;
    message: Record<string, unknown>;
  }

  export interface EthereumProvider {
    request: (args: {
      method: string;
      params?: Array<
        | string
        | number
        | boolean
        | Record<string, unknown>
        | Array<unknown>
        | TypedData
      >;
    }) => Promise<
      string | number | boolean | Record<string, unknown> | Array<unknown>
    >;
  }

  export interface Wallet {
    address: string;
    getEthereumProvider: () => Promise<EthereumProvider>;
    signTypedData?: (data: TypedData) => Promise<string>;
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

  export interface PrivyConfig {
    loginMethods: string[];
    appearance: {
      theme: string;
      accentColor: string;
      showWalletLoginFirst: boolean;
    };
    embeddedWallets: {
      createOnLogin: string;
    };
  }

  export interface PrivyProviderProps {
    appId: string;
    children: React.ReactNode;
    config: PrivyConfig;
  }

  export function usePrivy(): PrivyInterface;
  export function PrivyProvider(props: PrivyProviderProps): JSX.Element;
}
