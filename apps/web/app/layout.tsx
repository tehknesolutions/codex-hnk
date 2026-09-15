import type { Metadata } from 'next';
import './globals.css';
import '@hnk/ui/styles/kether.css';
import { WebHnkRuntimeProvider } from './_runtime/WebHnkRuntime';

export const metadata: Metadata = {
  title: 'HNK Codex',
  description: 'Plataforma digital do HNK Codex Interativo 365',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <WebHnkRuntimeProvider>{children}</WebHnkRuntimeProvider>
      </body>
    </html>
  );
}
