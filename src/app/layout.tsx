import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { ChatWidget } from "@/components/ChatWidget";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Makonnen Mulima — Front-end AI Engineer",
  description:
    "Portfolio of Makonnen Mulima, a front-end AI engineer and AWS Certified Cloud Practitioner. Projects, AWS case studies, and an AI-powered chat assistant.",
  openGraph: {
    title: "Makonnen Mulima — Front-end AI Engineer",
    description:
      "Portfolio of Makonnen Mulima, a front-end AI engineer and AWS Certified Cloud Practitioner. Projects, AWS case studies, and an AI-powered chat assistant.",
    url: "https://makonnen-mulima-portfolio.vercel.app",
    siteName: "Makonnen Mulima",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Makonnen Mulima — Front-end AI Engineer",
    description:
      "Portfolio of Makonnen Mulima, a front-end AI engineer and AWS Certified Cloud Practitioner. Projects, AWS case studies, and an AI-powered chat assistant.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-canvas dark:bg-canvas-dark text-ink dark:text-ink-dark font-body min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded focus:bg-brand dark:focus:bg-brand-dark focus:text-white focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
