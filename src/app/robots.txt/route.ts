import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://pawledger.org";
  const txt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /shelter
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  return new NextResponse(txt, { headers: { "Content-Type": "text/plain" } });
}
