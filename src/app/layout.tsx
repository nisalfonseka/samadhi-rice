import type { Metadata } from "next";
import { Fraunces, DM_Sans, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import CartDrawer from "@/components/cart/CartDrawer";
import WishlistDrawer from "@/components/shop/WishlistDrawer";
import SearchOverlay from "@/components/search/SearchOverlay";
import ChromeGate, { FooterGate } from "@/components/layout/ChromeGate";
import { getSettings } from "@/lib/services/settings.service";
import { getAssistantConfig } from "@/lib/services/assistant.service";
import { getProducts } from "@/lib/services/product.service";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";

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

const SITE = "https://samadhirice.lk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "SamadhiRice.lk — Heritage Sri Lankan Rice, Paddy Field to Plate",
    template: "%s · SamadhiRice.lk",
  },
  description:
    "Single-origin Sri Lankan rice — Suwandel, Kalu Heenati, red raw rice and Keeri Samba — milled fresh from family paddy fields and delivered to your kitchen. Traditional grains, modern convenience.",
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
    url: SITE,
    siteName: "SamadhiRice.lk",
    title: "SamadhiRice.lk — Heritage Sri Lankan Rice, Paddy Field to Plate",
    description:
      "Single-origin Sri Lankan rice, milled fresh from family paddy fields and delivered to your kitchen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SamadhiRice.lk — Heritage Sri Lankan Rice",
    description:
      "Single-origin Sri Lankan rice, milled fresh from family paddy fields and delivered to your kitchen.",
  },
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
        </SmoothScroll>
        <SpeedInsights />
      </body>
    </html>
  );
}
