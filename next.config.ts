import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/prosjekter',
        destination: '/work',
        permanent: true,
      },
      {
        source: '/prosjekter/:slug',
        destination: '/work/:slug',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/work',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/studio',
        permanent: true,
      },
      {
        source: '/om',
        destination: '/studio',
        permanent: true,
      },
      {
        source: '/om-oss',
        destination: '/studio',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/tjenester',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/kontakt',
        permanent: true,
      },
      {
        source: '/nyheter',
        destination: '/news',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
