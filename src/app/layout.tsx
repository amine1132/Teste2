import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationProvider";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Notre Histoire d'Amour",
  description: "Une histoire d'amour privée en quatre chapitres",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Notre Amour",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="overflow-hidden">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#be185d" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased touch-manipulation select-none`}
        style={{ 
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Overlay pour masquer la barre d'état sur iOS */}
          <div className="h-safe-top bg-black/20 backdrop-blur-sm"></div>
        </div>
        <NotificationProvider>
          <main className="relative z-10">
            {children}
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
