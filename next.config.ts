
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cocgikgckaozdsxqnjas.supabase.co',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'onvurqhacnjbgajtbokn.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is the correct way to handle server-side only packages in Next.js
    if (!isServer) {
      // Don't bundle these modules for the client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.externals.push('handlebars');
    return config;
  }
};

export default nextConfig;
