'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';

/**
 * Farcaster Mini App環境の検出結果
 */
export interface FarcasterEnvironmentState {
  /** Farcaster Mini App環境かどうか */
  isFarcasterEnvironment: boolean;
  /** 環境検出が完了したかどうか */
  isDetectionComplete: boolean;
  /** Farcaster SDKが利用可能かどうか */
  isSDKAvailable: boolean;
  /** User-AgentがFarcasterクライアントかどうか */
  isFarcasterUserAgent: boolean;
  /** URLパラメータにFarcaster関連の情報があるかどうか */
  hasFarcasterParams: boolean;
}

/**
 * Farcaster Mini App環境かどうかを判定するカスタムフック
 *
 * 判定方法:
 * 1. URLパラメータの確認 (frame_url, cast_hash, fid等)
 * 2. User-Agentの確認 (Farcaster関連の文字列)
 * 3. Farcaster SDKコンテキストの確認
 */
export function useFarcasterEnvironment(): FarcasterEnvironmentState {
  const [state, setState] = useState<FarcasterEnvironmentState>({
    isFarcasterEnvironment: false,
    isDetectionComplete: false,
    isSDKAvailable: false,
    isFarcasterUserAgent: false,
    hasFarcasterParams: false,
  });

  useEffect(() => {
    const detectFarcasterEnvironment = async () => {
      try {
        // 1. URLパラメータのチェック
        const urlParams = new URLSearchParams(window.location.search);
        const hasFarcasterParams = !!(
          urlParams.get('frame_url') ||
          urlParams.get('cast_hash') ||
          urlParams.get('fid') ||
          urlParams.get('fc_referrer') ||
          urlParams.get('miniapp') === 'true'
        );

        // 2. User-Agentのチェック
        const userAgent = navigator.userAgent.toLowerCase();
        const isFarcasterUserAgent = !!(
          userAgent.includes('farcaster') ||
          userAgent.includes('warpcast') ||
          userAgent.includes('miniapp')
        );

        // 3. Farcaster SDKの利用可能性チェック
        let isSDKAvailable = false;
        let hasValidContext = false;

        if (sdk) {
          try {
            isSDKAvailable = true;
            // SDKのコンテキストを取得して検証
            const context = await sdk.context;
            hasValidContext = !!context?.user;
          } catch (error) {
            console.warn('Failed to get Farcaster SDK context:', error);
          }
        }

        // 4. 総合判定
        const isFarcasterEnvironment = !!(
          hasFarcasterParams ||
          isFarcasterUserAgent ||
          (isSDKAvailable && hasValidContext)
        );

        setState({
          isFarcasterEnvironment,
          isDetectionComplete: true,
          isSDKAvailable,
          isFarcasterUserAgent,
          hasFarcasterParams,
        });

        // デバッグ情報を出力
        if (process.env.NODE_ENV === 'development') {
          console.log('Farcaster Environment Detection:', {
            isFarcasterEnvironment,
            hasFarcasterParams,
            isFarcasterUserAgent,
            isSDKAvailable,
            hasValidContext,
            urlParams: Object.fromEntries(urlParams.entries()),
            userAgent,
          });
        }
      } catch (error) {
        console.error('Error detecting Farcaster environment:', error);
        setState((prev) => ({
          ...prev,
          isDetectionComplete: true,
        }));
      }
    };

    detectFarcasterEnvironment();
  }, []);

  return state;
}

/**
 * Farcaster環境の簡易チェック関数（同期版）
 * useEffectが使用できない場面で利用
 */
export function checkFarcasterEnvironmentSync(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // URLパラメータのチェック
  const urlParams = new URLSearchParams(window.location.search);
  const hasFarcasterParams = !!(
    urlParams.get('frame_url') ||
    urlParams.get('cast_hash') ||
    urlParams.get('fid') ||
    urlParams.get('fc_referrer') ||
    urlParams.get('miniapp') === 'true'
  );

  // User-Agentのチェック
  const userAgent = navigator.userAgent.toLowerCase();
  const isFarcasterUserAgent = !!(
    userAgent.includes('farcaster') ||
    userAgent.includes('warpcast') ||
    userAgent.includes('miniapp')
  );

  return hasFarcasterParams || isFarcasterUserAgent;
}
