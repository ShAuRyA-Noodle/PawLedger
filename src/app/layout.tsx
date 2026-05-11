import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PHProvider } from "@/components/posthog-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: { default: "PawLedger — Compassion you can prove", template: "%s · PawLedger" },
  description: "Sponsor a rescued animal monthly. See every rupee on a public, tamper-evident ledger. Built with India's animal shelters.",
  keywords: ["animal welfare donation", "sponsor a dog", "stray animal rescue", "transparent charity India", "80G donation", "monthly donation animals"],
  authors: [{ name: "PawLedger" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "PawLedger — Compassion you can prove",
    description: "Sponsor a rescued animal monthly. See every rupee on a public ledger.",
    type: "website",
    siteName: "PawLedger",
  },
  twitter: { card: "summary_large_image", title: "PawLedger", description: "Sponsor a life. See every rupee." },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ed" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1817" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("pl_theme")?.value;
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable} ${theme === "dark" ? "dark" : ""}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <a href="#main" className="skip-link">Skip to content</a>
        <PHProvider>
          <SiteHeader />
          <main id="main" className="flex-1">{children}</main>
          <SiteFooter />
        </PHProvider>
      </body>
    </html>
  );
}
