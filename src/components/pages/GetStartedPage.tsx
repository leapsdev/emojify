import { DynamicFloatingEmojis } from '@/components/features/getStarted/FloatingEmojis';
import MainContent from '@/components/features/getStarted/MainContent';
import { LinkButton } from '@/components/ui/LinkButton';

export const GetStartedPage = () => {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <DynamicFloatingEmojis />

      <div className="relative z-10 flex flex-col min-h-screen p-6">
        <MainContent />
        <div className="mt-auto">
          <LinkButton
            href="/signup"
            content="Get started"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2.5 text-xl font-black flex justify-center items-center"
          />
        </div>
      </div>
    </main>
  );
};
