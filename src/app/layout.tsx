import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Sistema de Farmácia',
  description: 'Sistema completo de gerenciamento de farmácia com controle de estoque, vendas e relatórios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}