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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
