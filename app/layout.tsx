import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://natijati-encg-2026.vercel.app"),
  title: "ORIENTATION LGOSS | محاكي فرص القبول ENCG",
  description: "حسب فرصتك فالقبول في مدارس ENCG بناءً على لوائح الانتظار لسنتي 2025 و2026.",
  openGraph: {
    title: "ORIENTATION LGOSS | محاكي ENCG",
    description: "حسب فرصتك فالقبول في ENCG بالرتبة أو Code Massar.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "ar_MA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ORIENTATION LGOSS | محاكي ENCG",
    description: "حسب فرصتك فالقبول في ENCG بالرتبة أو Code Massar.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
