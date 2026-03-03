import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/Shell/AppShell";
import { ToastProvider } from "@/components/UI/Toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quozix.app"),
  title: "Quozix — OSINT Media Globe",
  description:
    "A zero-backend OSINT-style intelligence dashboard: 3D globe, live TV streams, international radio, and open-source signals — entirely client-side.",
  keywords: ["OSINT", "globe", "live TV", "radio", "signals", "news"],
  openGraph: {
    title: "Quozix — OSINT Media Globe",
    description: "Real-time OSINT dashboard: 3D globe, live TV, radio & signals",
    type: "website",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
