import type { NextConfig } from "next"

if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_FIREBASE_EMULATORS
) {
  throw new Error(
    "NEXT_PUBLIC_FIREBASE_EMULATORS is set for a production build. It points " +
      "sign-in at the local emulators and enables the persona switcher; it must " +
      "never be present in anything deployable."
  )
}

const nextConfig: NextConfig = {
  // ESLint runs in CI (`npm run lint`); the build does not repeat it.
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["genkit"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    // Genkit pulls in handlebars, which warns under webpack.
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
      /Critical dependency: the request of a dependency is an expression/,
    ]
    return config
  },
}

export default nextConfig
