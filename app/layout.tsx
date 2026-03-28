import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
  title: "Quozix News — Live World News TV & Radio Globe",
  description:
    "Stream live news TV channels and radio stations from every country on Earth, mapped to an interactive 3D globe. Free, open-source, and always on.",
  keywords: [
    "live news", "world news", "news TV channels", "news radio", "live streaming",
    "international news", "IPTV news", "news globe", "global news", "breaking news live",
    "free news streaming", "online news TV",
  ],
  authors: [{ name: "Yeshaya Shapiro", url: "mailto:yeshayashapiro@gmail.com" }],
  openGraph: {
    title: "Quozix News — Live World News TV & Radio Globe",
    description:
      "Stream live news TV channels and radio stations from every country on Earth, mapped to an interactive 3D globe. Free and open-source.",
    type: "website",
    url: "https://quozix.app",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quozix News — Live World News TV & Radio Globe",
    description:
      "Every news TV channel and radio station on Earth, on a 3D globe. Free, open-source.",
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
      <body>{children}</body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-J619TT2B0S"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-J619TT2B0S');
      `}</Script>
    </html>
  );
}
