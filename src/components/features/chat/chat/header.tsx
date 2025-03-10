import { SignOutButton } from '@/components/features/auth/signOutButton';
export const Header = () => {
  return (
    <div className="p-4 border-b flex items-center justify-center relative">
      <span className="text-2xl">💬</span>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <SignOutButton />
      </div>
    </div>
  );
};
