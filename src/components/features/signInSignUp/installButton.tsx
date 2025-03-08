'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    try {
      await deferredPrompt?.prompt();
      const { outcome } = await deferredPrompt?.userChoice ?? { outcome: 'dismissed' };
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('インストールプロンプトでエラーが発生しました:', error);
    }
  }, [deferredPrompt]);

  return (
    <Button
      onClick={handleInstall}
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <Download className="mr-2 h-5 w-5" />
      Install app
    </Button>
  );
};
