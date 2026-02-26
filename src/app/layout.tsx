import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/components/AudioProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'FirstRead',
  description: 'A fun way for kids to learn their letters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = process.env.NODE_ENV === 'production' ? '/first-read' : '';
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="icon" href={`${basePath}/logo.png`} />
        <link rel="apple-touch-icon" href={`${basePath}/apple-touch-icon.png`} />
        <meta name="theme-color" content="#09090b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap" rel="stylesheet" />
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="b8c360e4-fa3b-4800-bcf7-259c2fe5a061"
        />
      </head>
      <body className="font-body antialiased">
        <AudioProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
