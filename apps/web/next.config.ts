import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Production emit is allowed while repository-wide TypeScript debt is tracked
  // separately. This does NOT mark typecheck as passing; CI/typecheck remains a
  // distinct release gate until the historical errors are reconciled.
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@hnk/assets',
    '@hnk/audio-contract',
    '@hnk/canon-resolver',
    '@hnk/completion-contract',
    '@hnk/database',
    '@hnk/glyphs',
    '@hnk/linguas',
    '@hnk/practice-contract',
    '@hnk/progression',
    '@hnk/quest-engine',
    '@hnk/quest-library',
    '@hnk/quest-pack',
    '@hnk/real-world-action-contract',
    '@hnk/ritual-tone',
    '@hnk/supabase-client',
    '@hnk/ui',
    '@hnk/vault-contract',
    '@hnk/vault-interop-vectors',
    '@hnk/vault-web-crypto-lab',
    '@hnk/visual-contract',
  ],
  webpack(config) {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    };
    return config;
  },
};

export default nextConfig;
