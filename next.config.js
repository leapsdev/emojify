/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const withPWA = nextPWA({
  dest: 'public',
  cacheOnFrontEnd: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
};

module.exports = withPWA(nextConfig);
