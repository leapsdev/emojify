'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChevronRight, Mail, X } from 'lucide-react';
import Image from 'next/image';

import { WalletModalProps } from './types';

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 rounded-[32px] max-w-full sm:max-w-lg mx-auto bg-white">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <DialogTitle className="text-lg font-semibold">
            Login or sign up
          </DialogTitle>
          <button
            type="button"
            className="text-gray-600"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🤪</div>
        </div>

        {/* メールフォーム */}
        <div className="relative mb-6">
          <Input
            type="email"
            placeholder="your@email.com"
            className="pr-20 py-5 rounded-xl border-gray-200"
          />
          <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600">
            Submit
          </Button>
        </div>

        {/* ウォレットオプション */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start py-5 text-base font-normal border-gray-200 rounded-xl"
          >
            <div className="w-6 h-6 mr-3 flex-shrink-0">
              <Image
                src="/placeholder.svg"
                alt="Coinbase"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            Coinbase wallet
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start py-5 text-base font-normal border-gray-200 rounded-xl"
          >
            <div className="w-6 h-6 mr-3 flex-shrink-0">
              <Image
                src="/placeholder.svg"
                alt="Metamask"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            Metamask
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start py-5 text-base font-normal border-gray-200 rounded-xl"
          >
            <Mail className="w-6 h-6 mr-3" />
            More wallets
            <ChevronRight className="w-5 h-5 ml-auto" />
          </Button>
        </div>

        {/* フッター */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            Protected by
            <span className="text-4xl">🤪</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
