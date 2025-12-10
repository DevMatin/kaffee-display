import type { Metadata } from "next";
import "../styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Kaffee Katalog",
  description: "Specialty Coffee Katalog",
  applicationName: "Kaffee Katalog",
  manifest: "/manifest.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0b" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    title: "Kaffee Katalog",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/icon-192x192.png",
    other: [{ rel: "mask-icon", url: "/mask-icon.png", color: "#3e2723" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ErrorBoundary>
            <Header />
            {children}
            <Footer />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

