import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { PrivyProvider } from '@/components/providers/privy-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'Emoji-Chat',
  description: 'Emoji-Chat',
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Emoji-Chat',
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    shortcut: '/icons/icon-192x192.png',
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} antialiased`}>
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  );
}
