import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "PawLedger — Compassion you can prove",
    short_name: "PawLedger",
    description: "Sponsor a rescued animal monthly. See every rupee on a public ledger.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fbf7ed",
    theme_color: "#c9851a",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Browse animals", url: "/animals" },
      { name: "Report SOS", url: "/sos/report" },
      { name: "My dashboard", url: "/dashboard" },
    ],
    categories: ["lifestyle", "social", "donation"],
  });
}
