import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ClerkProvider } from '@clerk/nextjs'; // 👈 L'import vital

// Configuration de la police
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Studia",
  description: "Apprenez mieux, pas plus dur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 👇 C'est ICI que Clerk est activé pour TOUT le site
    <ClerkProvider>
      <html lang="fr" className={inter.variable}>
        <body className="min-h-screen flex flex-col bg-white selection:bg-slate-900 selection:text-white">
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}