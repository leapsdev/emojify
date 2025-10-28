import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@coinbase/onchainkit/styles.css';
import '@/styles/globals.css';
import { Providers } from '@/components/providers/Providers';
import { getFarcasterConfig } from '@/config/farcaster.config';

import { Toaster } from 'sonner';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// 環境に応じたfarcaster マニュフェストの読み込み
const farcasterConfig = getFarcasterConfig();
const miniapp = farcasterConfig.miniapp;

export const metadata: Metadata = {
  metadataBase: new URL(miniapp.homeUrl),
  title: miniapp.name,
  description: miniapp.description,
  manifest: '/manifest.json',
  openGraph: {
    title: miniapp.ogTitle || miniapp.name,
    description: miniapp.ogDescription || miniapp.description,
    images: [miniapp.ogImageUrl || miniapp.iconUrl],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: miniapp.version,
      imageUrl: miniapp.iconUrl,
      button: {
        title: miniapp.buttonTitle || 'Open',
        action: {
          type: 'launch_miniapp',
          name: miniapp.name,
          url: miniapp.homeUrl,
          splashImageUrl: miniapp.splashImageUrl,
          splashBackgroundColor: miniapp.splashBackgroundColor,
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
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
