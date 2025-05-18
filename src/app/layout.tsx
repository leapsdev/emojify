import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@coinbase/onchainkit/styles.css';
import '@/styles/globals.css';
import { OnchainProvider } from '@/components/providers/OnchainKitProvider';
import { PrivyProvider } from '@/components/providers/PrivyProvider';

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
  title: 'Emoji-Chat',
  description: 'Emoji-Chat',
  manifest: '/manifest.json',
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
            {children}
            <Toaster />
          </OnchainProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
