import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@coinbase/onchainkit/styles.css';
import '@/styles/globals.css';
import { OnchainProvider } from '@/components/providers/OnchainKitProvider';
import { PrivyProvider } from '@/components/providers/PrivyProvider';
import { FarcasterMiniAppInitializer } from '@/components/providers/FarcasterMiniAppInitializer';

import { Toaster } from 'sonner';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://emoji-chat-develop.vercel.app'),
  title: 'Emoji-Chat',
  description:
    'A Web3 chat application that uses only emojis. Create, buy and sell custom emojis while chatting with friends.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Emoji Chat',
    description: 'Web3 emoji-only chat app',
    images: ['/icons/icon-512x512.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://emoji-chat-develop.vercel.app/icons/icon-512x512.png',
      button: {
        title: 'Open Emoji Chat',
        action: {
          type: 'launch_frame',
          name: 'Emoji Chat',
          url: 'https://emoji-chat-develop.vercel.app',
          splashImageUrl: 'https://emoji-chat-develop.vercel.app/icons/icon-512x512.png',
          splashBackgroundColor: '#FFFFFF'
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PrivyProvider>
          <OnchainProvider>
            <FarcasterMiniAppInitializer />
            {children}
            <Toaster />
          </OnchainProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
