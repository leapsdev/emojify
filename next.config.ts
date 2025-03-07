import withPWA from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const nextConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
})({
  devIndicators: {
    appIsrStatus: false,
  },
  swcMinify: true,
} satisfies NextConfig);

export default nextConfig;
