import SupabaseContentSync from "@/components/SupabaseContentSync";
import type { Metadata } from "next";
import "./globals.css";
import JakSkyToast from "@/components/JakSkyToast";

export const metadata: Metadata = {
  title: {
    default: "JakSky — Premium Media Platform",
    template: "%s | JakSky",
  },
  description:
    "JakSky adalah platform media premium untuk menikmati konten gratis dan VIP, dengan sistem admin upload, moderator komunitas, dan owner control.",
  keywords: [
    "JakSky",
    "media platform",
    "video platform",
    "VIP content",
    "streaming",
    "premium media",
  ],
  authors: [{ name: "JakSky" }],
  creator: "JakSky",
  publisher: "JakSky",
  openGraph: {
    title: "JakSky — Premium Media Platform",
    description:
      "Nikmati konten gratis dan VIP dalam satu platform modern dengan tampilan premium.",
    siteName: "JakSky",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <JakSkyToast />
        {children}
        <SupabaseContentSync />
      </body>
    </html>
  );
}
