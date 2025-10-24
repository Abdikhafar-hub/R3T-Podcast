/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Increase body size limit for large video uploads
  experimental: {
    serverComponentsExternalPackages: ['cloudinary'],
  },
  // Configure API routes for large uploads
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
}

export default nextConfig
