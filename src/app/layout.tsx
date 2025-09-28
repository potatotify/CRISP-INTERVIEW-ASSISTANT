import "./globals.css";
import ReduxProvider from '@/components/ReduxProvider'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Crisp AI Interview',
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
        {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
