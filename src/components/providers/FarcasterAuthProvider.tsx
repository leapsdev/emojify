'use client';

import { Loading } from '@/components/ui/Loading';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface FarcasterAuthProviderProps {
  children: React.ReactNode;
}

export function FarcasterAuthProvider({
  children,
}: FarcasterAuthProviderProps) {
  const router = useRouter();
  const {
    isFarcasterAuthenticated,
    isFirebaseAuthenticated,
    isLoading,
    error,
    autoLoginAttempted,
    authenticateWithFarcaster,
  } = useFarcasterAuth();

  // 認証が成功したら/chatにリダイレクト - シンプル版
  useEffect(() => {
    console.log('🔍 認証状態チェック:', {
      isFarcasterAuthenticated,
      isFirebaseAuthenticated,
      isLoading,
    });

    if (isFarcasterAuthenticated && isFirebaseAuthenticated && !isLoading) {
      console.log('✅ 認証完了、/chatにリダイレクトします');
      router.push('/chat');
    }
  }, [isFarcasterAuthenticated, isFirebaseAuthenticated, isLoading, router]);

  /*
  useEffect(() => {
    console.log('🔍 認証状態チェック:', {
      isFarcasterAuthenticated,
      isFirebaseAuthenticated,
      isLoading,
      autoLoginAttempted,
      shouldRedirect:
        isFarcasterAuthenticated && isFirebaseAuthenticated && !isLoading,
    });

    if (isFarcasterAuthenticated && isFirebaseAuthenticated && !isLoading) {
      console.log('✅ 全認証完了、/chatにリダイレクトします');
      console.log('🚀 router.push("/chat")を実行中...');
      router.push('/chat');
    }
  }, [
    isFarcasterAuthenticated,
    isFirebaseAuthenticated,
    isLoading,
    autoLoginAttempted,
    router,
  ]);

  // 認証完了時の追加チェック - より積極的にリダイレクト
  useEffect(() => {
    if (isFarcasterAuthenticated && isFirebaseAuthenticated && !isLoading) {
      console.log('🔄 認証完了状態を再確認、強制リダイレクト実行');
      const timer = setTimeout(() => {
        console.log('🚨 タイマー経由でリダイレクト実行');
        window.location.href = '/chat';
      }, 500); // より短い遅延

      return () => clearTimeout(timer);
    }
  }, [isFarcasterAuthenticated, isFirebaseAuthenticated, isLoading]);

  // さらなる保険として、認証状態が変わったら即座にチェック
  useEffect(() => {
    console.log('⚡ 即座にリダイレクトチェック:', {
      isFarcasterAuthenticated,
      isFirebaseAuthenticated,
      isLoading,
    });

    if (isFarcasterAuthenticated && isFirebaseAuthenticated && !isLoading) {
      console.log('⚡ 即座にリダイレクト実行');
      router.replace('/chat'); // pushではなくreplaceを使用
    }
  }, [isFarcasterAuthenticated, isFirebaseAuthenticated, isLoading, router]);
  */

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
          <Loading size="lg" />
          <h2 className="text-lg font-semibold text-blue-800 mt-4 mb-2">
            {autoLoginAttempted
              ? 'Farcaster認証を処理中...'
              : 'Farcaster Mini Appを初期化中...'}
          </h2>
          <p className="text-sm text-blue-600">
            {autoLoginAttempted
              ? 'あなたのFarcasterアカウントで自動ログインしています'
              : 'しばらくお待ちください'}
          </p>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    console.error('Farcaster認証エラー:', error);

    let errorMessage = 'Farcaster認証エラーが発生しました';
    let errorDetails = '';

    if (error.includes('この機能はFarcaster Mini App環境でのみ利用可能です')) {
      errorMessage = 'Farcaster Mini App環境が必要です';
      errorDetails = 'このアプリはFarcaster内で起動してください';
    } else if (error.includes('Farcaster SDKが準備完了していません')) {
      errorMessage = 'Farcaster SDKの初期化中です';
      errorDetails = 'しばらく待ってから再試行してください';
    } else if (error.includes('Farcaster SDKが初期化されていません')) {
      errorMessage = 'Farcaster Mini Appの初期化に失敗しました';
      errorDetails = 'このアプリはFarcaster Mini App環境で実行してください';
    } else if (error.includes('ネットワークエラーが発生しました')) {
      errorMessage = 'Farcaster認証でネットワークエラー';
      errorDetails =
        'CORS制限またはネットワークの問題です。しばらく待ってから再試行してください';
    } else if (error.includes('認証リクエストに問題があります')) {
      errorMessage = 'Farcaster認証リクエストエラー';
      errorDetails = 'アプリを再読み込みしてから再試行してください';
    } else if (error.includes('Farcasterトークンの取得に失敗しました')) {
      errorMessage = 'Farcaster認証の取得に失敗しました';
      errorDetails = 'Farcasterアカウントでの認証を確認してください';
    } else if (error.includes('Firebaseトークンの取得に失敗しました')) {
      errorMessage = 'Firebase認証の初期化に失敗しました';
      errorDetails = 'ネットワーク接続または認証設定を確認してください';
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {errorMessage}
          </h2>
          {errorDetails && (
            <p className="text-sm text-red-600 mb-4">{errorDetails}</p>
          )}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => authenticateWithFarcaster()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
            >
              再試行
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors w-full"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 認証されていない場合の表示
  if (!isFarcasterAuthenticated || !isFirebaseAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            {autoLoginAttempted
              ? 'Farcaster認証を完了してください'
              : 'Farcaster認証が必要です'}
          </h2>
          <p className="text-sm text-blue-600 mb-4">
            {autoLoginAttempted
              ? '自動ログインに失敗しました。手動でFarcaster認証を行ってください。'
              : 'このアプリを使用するには、Farcaster認証が必要です。'}
          </p>
          <button
            type="button"
            onClick={() => authenticateWithFarcaster()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Farcasterで認証
          </button>
        </div>
      </div>
    );
  }

  // 認証済みの場合、子コンポーネントを表示
  return <>{children}</>;
}
