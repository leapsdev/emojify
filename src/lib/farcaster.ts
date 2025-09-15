import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterContext {
  [key: string]: unknown;
}

export interface FarcasterInitializationResult {
  isSDKLoaded: boolean;
  isReady: boolean;
  context: FarcasterContext | null;
  isMiniApp: boolean;
  error: string | null;
}

/**
 * Farcaster SDKを初期化
 */
async function initializeFarcasterSDK(): Promise<void> {
  if (!sdk) {
    throw new Error('Farcaster SDK is not available');
  }

  await sdk.actions.ready();
}

/**
 * Mini Appかどうかを判定
 */
function checkIfMiniApp(ctx: unknown): boolean {
  if (!ctx) {
    return false;
  }

  // オブジェクトの場合、プロパティが存在するかチェック
  if (typeof ctx === 'object' && ctx !== null) {
    const keys = Object.keys(ctx);
    return keys.length > 0;
  }

  // プリミティブ値の場合は有効とみなす
  return true;
}

/**
 * Farcasterコンテキストを取得してMini App判定を行う
 */
async function initializeFarcasterContext(): Promise<{
  context: FarcasterContext | null;
  isMiniApp: boolean;
}> {
  if (!sdk) {
    throw new Error('Farcaster SDK is not available');
  }

  const ctx = await sdk.context;
  const isApp = checkIfMiniApp(ctx);

  console.log('Farcaster context:', ctx);
  console.log('Farcaster Mini App:', isApp);

  return {
    context: ctx as FarcasterContext | null,
    isMiniApp: isApp,
  };
}

/**
 * Farcaster SDKインスタンスを取得
 */
export function getFarcasterSDK() {
  return sdk;
}

/**
 * Farcaster Mini Appの完全な初期化を実行
 */
export async function initializeFarcasterMiniApp(): Promise<FarcasterInitializationResult> {
  try {
    // SDKの初期化
    await initializeFarcasterSDK();

    // コンテキストの初期化
    const { context, isMiniApp } = await initializeFarcasterContext();

    return {
      isSDKLoaded: true,
      isReady: true,
      context,
      isMiniApp,
      error: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Farcaster Mini App initialization error:', error);

    return {
      isSDKLoaded: true,
      isReady: true,
      context: null,
      isMiniApp: false,
      error: errorMessage,
    };
  }
}
