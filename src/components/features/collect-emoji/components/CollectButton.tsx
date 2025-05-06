import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export function CollectButton() {
  return (
    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-bold mt-8">
      <Plus className="w-5 h-5 mr-2" />
      Collect
    </Button>
  );
}
