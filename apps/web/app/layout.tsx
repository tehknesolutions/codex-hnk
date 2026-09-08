import type { Metadata } from 'next';
import './globals.css';
import '@hnk/ui/styles/kether.css';

export const metadata: Metadata = {
  title: 'HNK Codex',
  description: 'Plataforma digital do HNK Codex Interativo 365',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
