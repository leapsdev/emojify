'use client';

import type { EmojiProps } from '@/components/features/profile/types';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
import { EmojiGrid } from './EmojiGrid';

interface ProfileTabsProps {
  createdEmojis: EmojiProps[];
  collectedEmojis: EmojiProps[];
}

export const ProfileTabs = ({
  createdEmojis,
  collectedEmojis,
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = React.useState('created');

  return (
    <TabsPrimitive.Root
      defaultValue="created"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="border-b">
        <TabsPrimitive.List className="flex w-full h-auto p-0 bg-transparent">
          <TabsPrimitive.Trigger
            value="created"
            className={cn(
              'flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black font-black text-lg',
              activeTab !== 'created' && 'text-gray-400 border-transparent',
            )}
          >
            Created
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            value="collected"
            className={cn(
              'flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-black font-black text-lg',
              activeTab !== 'collected' && 'text-gray-400 border-transparent',
            )}
          >
            Collected
          </TabsPrimitive.Trigger>
        </TabsPrimitive.List>
      </div>

      <TabsPrimitive.Content value="created" className="p-2">
        <EmojiGrid emojis={createdEmojis} />
      </TabsPrimitive.Content>

      <TabsPrimitive.Content value="collected" className="p-2">
        <EmojiGrid emojis={collectedEmojis} />
      </TabsPrimitive.Content>
    </TabsPrimitive.Root>
  );
};
