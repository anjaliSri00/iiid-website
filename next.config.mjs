// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: false,

  // Asset prefix for static files
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  
  // Handle rewrites for static assets
  async rewrites() {
    return [
      {
        source: '/js/:path*',
        destination: '/_next/static/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      }
    ];

  },

  images: {
    domains: [
      "iiid-web-production.s3.ap-south-1.amazonaws.com",
      "iiid-website-local-bucket.s3.ap-south-1.amazonaws.com",
    ],
        qualities: [25, 50, 75, 85],  // Add 85 here

  },

  // experimental: {
  //   serverComponentsExternalPackages: ['@react-pdf/renderer'],
  // },

  // Production optimizations
  // poweredByHeader: false,
  // generateEtags: true,
};

export default nextConfig;