import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Packago - Configuratore Enterprise Packaging",
  description: "Configuratore professionale per packaging personalizzato White Label e Private Label. Lattine, etichette e packaging custom enterprise.",
  keywords: "packaging, white label, private label, lattine, etichette, configuratore",
  authors: [{ name: "Packago Enterprise" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Packago - Configuratore Enterprise Packaging",
    description: "Configuratore professionale per packaging personalizzato",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Skip Links for Keyboard Navigation */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-[#ed6d23] text-white px-4 py-2 rounded-lg font-medium"
        >
          Salta al contenuto principale
        </a>
        <a 
          href="#navigation" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-44 focus:z-50 bg-[#ed6d23] text-white px-4 py-2 rounded-lg font-medium"
        >
          Salta alla navigazione
        </a>
        {children}
      </body>
    </html>
  );
}
