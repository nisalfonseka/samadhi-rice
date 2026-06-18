import type { Metadata } from "next";
import { Fraunces, DM_Sans, Noto_Serif_Sinhala } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import CartDrawer from "@/components/cart/CartDrawer";
import ChromeGate from "@/components/layout/ChromeGate";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${notoSinhala.variable} antialiased`}
    >
      <body className="relative min-h-screen">
        <SmoothScroll>
          <ChromeGate>
            <Header />
          </ChromeGate>
          <main className="relative z-10">{children}</main>
          <ChromeGate>
            <Footer />
            <FloatingActions />
            <CartDrawer />
          </ChromeGate>
        </SmoothScroll>
      </body>
    </html>
  );
}
