import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://orientation-lgoss.vercel.app"),
  title: "ORIENTATION LGOSS | منصة تقدير فرص القبول",
  description: "منصة تفاعلية لتقدير فرص القبول في ENCG وENSA وENSAM وكليات الصحة وFST وEST.",
  keywords: ["Orientation LGOSS", "orientation Maroc", "ENCG", "ENSA", "ENSAM", "médecine Maroc", "FST", "EST", "listes d'attente 2026"],
  verification: { google: "ZpJi5KOI7m9lfwmULDojtbC7fp9s7dXc9hrEORVR74g" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
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
      <body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Orientation LGOSS",
        alternateName: "ORIENTATION LGOSS",
        url: "https://orientation-lgoss.vercel.app/",
        description: "منصة مغربية لتقدير فرص القبول والتوجيه بعد البكالوريا.",
        inLanguage: ["ar-MA", "fr-MA"],
      }) }} /></body>
    </html>
  );
}
