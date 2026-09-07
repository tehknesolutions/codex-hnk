import type { Metadata } from 'next';
import { VaultCryptoLab } from './VaultCryptoLab';

export const metadata: Metadata = {
  title: 'Web Vault Crypto Lab V1 · HNK',
  robots: { index: false, follow: false },
};

export default function VaultCryptoLabPage() {
  return <VaultCryptoLab />;
}
