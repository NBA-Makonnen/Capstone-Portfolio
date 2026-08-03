import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { ChatWidget } from "@/components/ChatWidget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Makonnen Mulima",
  description: "Welcome to My Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-dark font-body min-h-screen">
        <Header />
        <main>{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}
