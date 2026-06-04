import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { UserProvider } from "@/context/AuthContext";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "drafted",
  description: "이력서는 영원히 초안 — 시기별 이력서 정리·공유 커뮤니티",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
