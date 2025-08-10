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
  experimental: {
    // Ensure pdfkit is not bundled so it can load its font data files at runtime
    serverComponentsExternalPackages: ["pdfkit"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existingExternals = Array.isArray(config.externals) ? config.externals : []
      config.externals = [...existingExternals, "pdfkit", "fontkit"]
    }
    return config
  },
}

export default nextConfig
