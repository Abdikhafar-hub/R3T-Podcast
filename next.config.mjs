/** @type {import('next').NextConfig} */
const nextConfig = {
  // In Next 16, these go directly here, not under experimental or eslint keys
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['cloudinary'],
  
  // Disable these for production stability if you have errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig