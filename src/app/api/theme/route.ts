import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { theme } = await req.json() as { theme: "light" | "dark" };
  const res = NextResponse.json({ ok: true });
  res.cookies.set("pl_theme", theme, { httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  return res;
}
