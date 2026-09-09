import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'checkout.lien-bio.site',
          },
        ],
        destination: 'https://enfancience-academy.mychariow.shop/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
