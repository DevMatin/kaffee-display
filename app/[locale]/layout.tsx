import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { defaultLocale, locales } from "@/i18n";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0b" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  return {
    title: isEnglish ? "Coffee Catalog" : "Kaffee Katalog",
    description: isEnglish ? "Specialty Coffee Catalog" : "Specialty Coffee Katalog",
    applicationName: isEnglish ? "Coffee Catalog" : "Kaffee Katalog",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: isEnglish ? "Coffee Catalog" : "Kaffee Katalog",
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
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "de-DE": "/de",
        "en-US": "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <ErrorBoundary>
              <Header />
              {children}
              <Footer />
            </ErrorBoundary>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

