import withPWAInit from "next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  disable: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/api/:path*',
      },
      {
        source: '/public/uploads/:path*',
        destination: 'http://127.0.0.1:5000/public/uploads/:path*',
      },
    ]
  },
}

export default withPWA(nextConfig)
