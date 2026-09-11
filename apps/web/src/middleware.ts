import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const LOCALES = ["en", "hi", "chg"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bypass API, Admin, Preview, Next.js internals, and files with extensions
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/preview") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    try {
      return createClient(request);
    } catch {
      return NextResponse.next();
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // If already localized, continue
  if (LOCALES.includes(firstSegment)) {
    try {
      return createClient(request);
    } catch {
      return NextResponse.next();
    }
  }

  // Normalize public URL by redirecting to default locale /en/...
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
