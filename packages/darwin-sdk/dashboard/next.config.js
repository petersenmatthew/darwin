const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize problematic Node.js-only packages
      // This prevents webpack from trying to bundle them
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        {
          '@browserbasehq/stagehand': 'commonjs @browserbasehq/stagehand',
          'playwright': 'commonjs playwright',
          'puppeteer': 'commonjs puppeteer',
        },
        // Externalize the core package directory
        ({ request, context }, callback) => {
          if (request && context) {
            try {
              const resolved = path.resolve(context, request);
              const corePath = path.resolve(__dirname, '../core');
              if (resolved.startsWith(corePath)) {
                return callback(null, `commonjs ${request}`);
              }
            } catch (e) {
              // Ignore resolution errors
            }
          }
          callback();
        },
      ];

      // Don't bundle Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  // This tells Next.js to not bundle these packages
  experimental: {
    serverComponentsExternalPackages: [
      '@browserbasehq/stagehand',
      'playwright',
      'puppeteer',
    ],
  },
};

module.exports = nextConfig;
