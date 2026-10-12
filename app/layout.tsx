import type { Metadata } from "next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mynghedongphong.vn"),
  title: "Mỹ Nghệ Đông Phong — Đồ Gỗ Quý Mỹ Nghệ & Phong Thủy",
  description:
    "Chuyên chế tác mộc thủ công từ các loại gỗ quý tự nhiên: Tử Đàn, Sưa, Nu Bách Xanh, Huyết Long, Mun Sừng. Tư vấn Zalo và hotline trực tiếp.",
  keywords: ["đồ gỗ mỹ nghệ", "vòng tay phong thủy", "bút ký gỗ quý", "mỹ nghệ đông phong"],
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/images/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/logo.png",
  },
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingZalo from "@/components/layout/FloatingZalo";
import BackToTop from "@/components/ui/BackToTop";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageTransition from "@/components/ui/PageTransition";
import ToastContainer from "@/components/ui/Toast";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${playfair.variable} ${beVietnam.variable}`}>
      <body className="min-h-screen antialiased flex flex-col bg-bg text-text pb-16 md:pb-0">
        <GoogleAnalytics />
        <Header />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <BackToTop />
        <FloatingZalo />
        <MobileBottomNav />
        <ToastContainer />
      </body>
    </html>
  );
}
