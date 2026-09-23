import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
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
