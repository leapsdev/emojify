import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = withPWA({
  dest: 'public',
})({
  devIndicators: {
    appIsrStatus: false,
  },
} satisfies NextConfig);

export default nextConfig;