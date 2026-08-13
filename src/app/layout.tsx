import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import BottomNav from "@/components/layout/BottomNav";
import CartDrawer from "@/components/cart/CartDrawer";
import WishlistDrawer from "@/components/shop/WishlistDrawer";
import SearchOverlay from "@/components/search/SearchOverlay";
import ChromeGate, { FooterGate } from "@/components/layout/ChromeGate";
import { getSettings } from "@/lib/services/settings.service";
import { getAssistantConfig } from "@/lib/services/assistant.service";
import { getProducts } from "@/lib/services/product.service";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoSinhala = Noto_Serif_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "SamadhiRice.lk — Heritage Sri Lankan Rice, Paddy Field to Plate",
    template: "%s · SamadhiRice.lk",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Sri Lankan rice",
    "Suwandel rice",
    "Kalu Heenati",
    "red raw rice",
    "Keeri Samba",
    "traditional rice Sri Lanka",
    "buy rice online Sri Lanka",
    "SamadhiRice",
  ],
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "SamadhiRice.lk — Heritage Sri Lankan Rice, Paddy Field to Plate",
    description:
      "Browse Sri Lankan rice varieties with current prices, pack sizes and delivery information.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "SamadhiRice.lk — Heritage Sri Lankan Rice",
    description:
      "Browse Sri Lankan rice varieties with current prices, pack sizes and delivery information.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? {
          other: {
            "msvalidate.01": process.env.BING_SITE_VERIFICATION,
          },
        }
      : {}),
  },
  category: "food and drink",
};

export const viewport: Viewport = {
  themeColor: "#324327",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, assistant, chatProducts] = await Promise.all([
    getSettings(),
    getAssistantConfig(),
    getProducts({}).catch(() => []),
  ]);
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${notoSinhala.variable} antialiased`}
    >
      <body className="relative min-h-screen">
        <NextTopLoader color="#c79a3b" showSpinner={false} height={3} />
        <SmoothScroll>
          <ChromeGate>
            <Header hotline={settings.contactPhone} />
          </ChromeGate>
          <main className="relative z-10">{children}</main>
          <FooterGate>
            <Footer />
            <FloatingActions
              whatsapp={settings.contactWhatsapp}
              assistant={{
                enabled: assistant.enabled,
                greeting: assistant.greeting,
                suggestions: assistant.suggestions,
              }}
              products={chatProducts}
            />
            <CartDrawer
              freeDeliveryEnabled={settings.freeDeliveryEnabled}
              freeDeliveryThreshold={settings.freeDeliveryThreshold}
            />
            <WishlistDrawer products={chatProducts} />
            <SearchOverlay />
          </FooterGate>
          {/* outside FooterGate so it also shows on /rice-finder; last in flow so
              its spacer keeps the footer clear of the fixed bar */}
          <ChromeGate>
            <BottomNav />
          </ChromeGate>
        </SmoothScroll>
        <SpeedInsights />
      </body>
    </html>
  );
}
