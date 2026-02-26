import type { Metadata } from 'next';
import './globals.css';
import { PolarisProvider } from '@/components/PolarisProvider';

export const metadata: Metadata = {
  title: 'Shopify Store Migrator',
  description: 'Migrate all data from one Shopify store to another',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PolarisProvider>{children}</PolarisProvider>
      </body>
    </html>
  );
}
