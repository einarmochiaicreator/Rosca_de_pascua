import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rosca de Pascua | Gustazo Gluten Free",
  description: "Reservá tu Rosca de Pascua artesanal sin gluten. Solo 30 unidades.",
  openGraph: {
    title: "Rosca de Pascua | Gustazo Gluten Free",
    description: "Solo 30 unidades. Reservá la tuya antes de que se agoten.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
