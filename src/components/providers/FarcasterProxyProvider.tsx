'use client';

import { useEffect } from 'react';
import { initializeFetchInterceptor } from '@/lib/fetch-interceptor';

/**
 * Farcaster SDK用のプロキシService Workerを登録するプロバイダー
 * Privy analytics eventsのCORSエラーを解決するためのプロキシ機能を提供
 */
export function FarcasterProxyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Fetch interceptorを即座に初期化（最優先）
    initializeFetchInterceptor();
    
    // Service Workerがサポートされているかチェック
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerFarcasterProxy();
      
      // デバッグ用: 現在のService Worker状況を確認
      setTimeout(checkServiceWorkerStatus, 2000);
    }
  }, []);

  const registerFarcasterProxy = async () => {
    try {
      console.log('🔧 Registering Farcaster proxy Service Worker...');

      // カスタムService Workerを登録
      const registration = await navigator.serviceWorker.register(
        '/custom-sw.js',
        {
          scope: '/',
          updateViaCache: 'none',
        },
      );

      console.log('✅ Farcaster proxy Service Worker registered successfully');

      // Service Workerが更新された場合の処理
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              console.log('🚀 New Service Worker installed and ready');
            }
          });
        }
      });

      // Service Workerの状態変更を監視
      if (registration.active) {
        console.log('🟢 Service Worker is active and ready');
      } else if (registration.installing) {
        console.log('🟡 Service Worker is installing...');
      } else if (registration.waiting) {
        console.log('🟠 Service Worker is waiting...');
      }
    } catch (error) {
      console.warn(
        '⚠️ Failed to register Farcaster proxy Service Worker:',
        error,
      );
      // Service Worker登録に失敗してもアプリケーションは継続
    }
  };

  const checkServiceWorkerStatus = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('🔍 All Service Worker registrations:', registrations.length);
      
      registrations.forEach((registration, index) => {
        console.log(`📋 Registration ${index + 1}:`, {
          scope: registration.scope,
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
          updateViaCache: registration.updateViaCache
        });
      });

      // 現在のページがService Workerに制御されているかチェック
      if (navigator.serviceWorker.controller) {
        console.log('🎯 Current page is controlled by Service Worker:', navigator.serviceWorker.controller.scriptURL);
      } else {
        console.warn('⚠️ Current page is NOT controlled by any Service Worker');
      }
    } catch (error) {
      console.error('❌ Error checking Service Worker status:', error);
    }
  };

  return <>{children}</>;
}
