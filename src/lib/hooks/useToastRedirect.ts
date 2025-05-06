import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useToastRedirect() {
  const router = useRouter();

  return (message: string, redirectPath: string) => {
    toast.success(message);
    setTimeout(() => {
      router.push(redirectPath);
    }, 1000);
  };
}
