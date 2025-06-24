/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
// Allow images from r2.comfy.icu
module.exports = {
  ...nextConfig,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'r2.comfy.icu',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
// Allow images from replicate.delivery
module.exports.images.remotePatterns.push({
  protocol: 'https',
  hostname: 'replicate.delivery',
  port: '',
  pathname: '/**',
});
