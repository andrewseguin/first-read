import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster";
import { AudioProvider } from "@/components/AudioProvider";
import { ThemeProvider } from "@/components/theme-provider";
import './globals.css';

export const metadata: Metadata = {
  title: 'FirstRead',
  description: 'A fun way for kids to learn their letters.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#09090b" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap" rel="stylesheet" />
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
