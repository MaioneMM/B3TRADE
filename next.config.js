/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['pt-BR', 'en'],
    defaultLocale: 'pt-BR',
  },
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
