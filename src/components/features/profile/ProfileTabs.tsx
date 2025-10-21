'use client';

import type { EmojiProps } from '@/components/features/profile/types';
import { cn } from '@/lib/utils';
import { Content, List, Root, Trigger } from '@radix-ui/react-tabs';
import { useState } from 'react';
import { EmojiGrid } from './EmojiGrid';
import { EmojiGridSkeleton } from './EmojiGridSkeleton';

interface ProfileTabsProps {
  createdEmojis: EmojiProps[];
  collectedEmojis: EmojiProps[];
  isLoadingCreated?: boolean;
  isLoadingCollected?: boolean;
}

export const ProfileTabs = ({
  createdEmojis,
  collectedEmojis,
  isLoadingCreated = false,
  isLoadingCollected = false,
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState('created');

  return (
    <Root
      defaultValue="created"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="border-b">
        <List className="flex w-full h-auto p-0 bg-transparent">
          <Trigger
            value="created"
            className={cn(
              'flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black font-black text-lg',
              activeTab !== 'created' && 'text-gray-400 border-transparent',
            )}
          >
            Created
          </Trigger>
          <Trigger
            value="collected"
            className={cn(
              'flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black font-black text-lg',
              activeTab !== 'collected' && 'text-gray-400 border-transparent',
            )}
          >
            Collected
          </Trigger>
        </List>
      </div>

      <Content value="created" className="p-2">
        {isLoadingCreated && createdEmojis.length === 0 ? (
          <EmojiGridSkeleton count={6} />
        ) : (
          <EmojiGrid emojis={createdEmojis} />
        )}
      </Content>

      <Content value="collected" className="p-2">
        {isLoadingCollected && collectedEmojis.length === 0 ? (
          <EmojiGridSkeleton count={6} />
        ) : (
          <EmojiGrid emojis={collectedEmojis} />
        )}
      </Content>
    </Root>
  );
};
