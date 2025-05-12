import { useEffect, useState } from 'react';

type DisplayMode = 'standalone' | 'browser' | 'minimal-ui' | 'fullscreen';

const getDisplayMode = (): DisplayMode | null => {
  if (typeof window === 'undefined') return null;

  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  if (mediaQuery.matches) return 'standalone';

  return null;
};

const isIOSStandalone = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  return (
    'standalone' in navigator &&
    typeof navigator.standalone === 'boolean' &&
    navigator.standalone
  );
};

export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const displayMode = getDisplayMode();
    setIsPWA(displayMode === 'standalone' || isIOSStandalone());
  }, []);

  return isPWA;
};
