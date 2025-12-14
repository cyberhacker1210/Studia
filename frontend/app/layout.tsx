import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

// Configuration Mobile
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Studia",
  description: "L'IA qui booste tes résultats scolaires.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Studia",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${inter.variable} antialiased`}>
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-12WVTRWTWR"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-12WVTRWTWR');
            `}
          </Script>
        </head>
        <body className="min-h-screen flex flex-col bg-slate-50 selection:bg-slate-900 selection:text-white overscroll-none touch-pan-y">
          <LanguageProvider>
            {children}
          </LanguageProvider>

          {/* ✅ SERVICE WORKER REGISTRATION */}
          <Script id="register-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed: ', err);
                    }
                  );
                });
              }
            `}
          </Script>
        </body>
      </html>
    </ClerkProvider>
  );
}