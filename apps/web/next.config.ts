import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
};

export default nextConfig;
