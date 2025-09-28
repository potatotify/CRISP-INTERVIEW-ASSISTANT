import "./globals.css";
import ReduxProvider from '@/components/ReduxProvider'
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
