import { Plus, User2 } from 'lucide-react';

export function ProfileImage() {
  return (
    <div className="flex justify-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border">
          <User2 className="w-16 h-16 text-gray-400" />
        </div>
        <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
