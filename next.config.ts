import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Never expose server-only env vars to the client bundle. Only variables
  // explicitly prefixed NEXT_PUBLIC_ are ever sent to the browser by Next —
  // this comment documents the intent, not a mechanism (Next enforces it).
  poweredByHeader: false,
};

export default nextConfig;
