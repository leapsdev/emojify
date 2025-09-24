'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { LinkButton } from '@/components/ui/LinkButton';

export const GetStartedButton = () => {
  const { isMiniApp } = useIsMiniApp();
  const href = isMiniApp ? '/profile/create' : '/signup';

  return (
    <div className="mt-auto">
      <LinkButton
        href={href}
        content="Get started"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2.5 text-xl font-black flex justify-center items-center"
      />
    </div>
  );
};
