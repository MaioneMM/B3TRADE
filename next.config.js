/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-symbol-logo.tradingview.com',
      },
    ],
  },
}

module.exports = nextConfig
