'use client';

import { useCallback, useEffect, useState } from 'react';

export const useInstallPrompt = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt,
        );
      }
    };
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsInstallable(false);
        }
      } else {
        setShowInstallModal(true);
      }
    } catch (error) {
      console.error('インストールプロンプトでエラーが発生しました:', error);
      setShowInstallModal(true);
    }
  }, [deferredPrompt]);

  return {
    showInstallModal,
    setShowInstallModal,
    handleInstall,
    isInstallable,
  };
};
