/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['twilio', 'pdf-parse'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
