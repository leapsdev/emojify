import { usePrivy } from '@privy-io/react-auth';

export function usePrivyId() {
  const { user } = usePrivy();
  return user?.id;
}
