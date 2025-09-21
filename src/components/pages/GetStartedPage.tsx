import { DynamicFloatingEmojis } from '@/components/features/getStarted/FloatingEmojis';
import { GetStartedButton } from '@/components/features/getStarted/GetStartedButton';
import MainContent from '@/components/features/getStarted/MainContent';

export const GetStartedPage = () => {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <DynamicFloatingEmojis />
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        <MainContent />
        <GetStartedButton />
      </div>
    </main>
  );
};
