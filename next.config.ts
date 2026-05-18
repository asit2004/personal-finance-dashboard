import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  // Empty turbopack config satisfies Next.js 16 when a webpack plugin (next-pwa) is also present.
  // next-pwa's service worker is only generated during `next build` (webpack), not in dev (Turbopack).
  turbopack: {},
};

export default withPWA(nextConfig);
