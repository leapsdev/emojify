/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  register: true,
  scope: '/',
  sw: 'sw.js',
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true
  },
});

const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json; charset=utf-8'
          }
        ]
      }
    ];
  }
};

module.exports = withPWA(nextConfig);
