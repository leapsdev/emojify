import InstallPrompt from '@/components/features/pwa/installPrompt';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '../../ui/dialog';
interface InstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallModal({ open, onOpenChange }: InstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!rounded-[24px] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] p-0 w-[min(90vw,32rem)] bg-white">
        <DialogClose className="absolute right-4 top-4 rounded-full hover:bg-gray-100 p-2 transition-colors">
          <X className="w-4 h-4" />
        </DialogClose>
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🤪</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <DialogTitle className="text-xl font-black">
              Install Emoji Chat
            </DialogTitle>
            <p className="text-gray-600 font-medium">
              Add the app to your home screen
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <InstallPrompt />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
