import type { Metadata, Viewport } from "next";
import { Amiri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/content";
import { StructuredData } from "@/components/StructuredData";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domains.primary),
  title: {
    default: "Shuhada Foundation of Ireland | Shaheed Bilal Masjid",
    template: "%s | Shuhada Foundation of Ireland",
  },
  description: siteConfig.description,
  applicationName: siteConfig.organizationName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: siteConfig.domains.primary,
    siteName: siteConfig.organizationName,
    title: "Shuhada Foundation of Ireland | Shaheed Bilal Masjid",
    description: siteConfig.description,
    images: [{ url: "/images/masjid-project-view.jpg", width: 1200, height: 800, alt: "Shaheed Bilal Masjid project view" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shuhada Foundation of Ireland",
    description: siteConfig.description,
    images: ["/images/masjid-project-view.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#12372A",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakarta.variable + " " + amiri.variable}>
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
