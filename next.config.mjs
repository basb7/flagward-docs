import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Emits .next/standalone with a minimal server.js and only the traced
  // node_modules, so the Docker runtime stage stays small.
  output: 'standalone',
};

export default withMDX(config);
