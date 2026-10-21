import type { ReactNode } from 'react';
import './globals.css';
import { BootingAnimation } from './components/BootingAnimation';
import { IocProvider } from './ioc';

export const metadata = {
  title: 'Peruvian Supernatural Beings Sandbox',
  description: 'Emergent verification probe for tinkuy-react',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-identity-primary text-white min-h-screen">
        <BootingAnimation />
        <IocProvider>{children}</IocProvider>
      </body>
    </html>
  );
}
