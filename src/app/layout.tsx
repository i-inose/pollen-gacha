import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "花粉ガチャ - 今日の花粉レベルでガチャを引こう！",
  description:
    "花粉飛散レベルに応じて排出率が変化するガチャアプリ。花粉モンスターを集めよう！",
  openGraph: {
    title: "花粉ガチャ",
    description: "今日の花粉レベルでガチャを引こう！花粉が多い日はレアキャラのチャンス！",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
