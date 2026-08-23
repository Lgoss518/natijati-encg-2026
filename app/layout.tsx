import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://orientation-lgoss-2026.vercel.app"),
  title: "ORIENTATION LGOSS | منصة تقدير فرص القبول",
  description: "منصة تفاعلية لتقدير فرص القبول في ENCG وENSA وENSAM وكليات الصحة وFST وEST.",
  openGraph: {
    title: "ORIENTATION LGOSS | منصة التوجيه والقبول",
    description: "حسب فرصتك في مدارس التجارة والهندسة والصحة والعلوم والتكنولوجيا.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "ar_MA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ORIENTATION LGOSS | منصة التوجيه والقبول",
    description: "محاكيات ENCG وENSA وENSAM والصحة وFST وEST في منصة واحدة.",
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
