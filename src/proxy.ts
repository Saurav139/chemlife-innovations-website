import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isStagingHost } from "@/lib/seo";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isTranslatedPath, isLocale, localizePath, preferredLocale } from "@/i18n/config";

// Every page lives under src/app/[locale]. English keeps its plain addresses: /products is served from
// /en/products behind the scenes, and /en/products redirects to /products. /kn/... and /hi/... pass through.
// A visitor whose browser asks for Kannada or Hindi before English is sent from a translated page's plain
// address to that language's version, unless they picked a language in the switcher (the "lang" cookie).
// The staging site (any address other than the live domain) is also kept out of search results, and asks for
// a password when STAGING_PASSWORD is set in its environment.
export function proxy(request: NextRequest) {
  // Only the Host header: the server routes requests by it, so it can't be faked to look like the live site.
  if (!isStagingHost(request.headers.get("host") ?? "")) return localeRouting(request);

  const password = process.env.STAGING_PASSWORD;
  if (password && !hasPassword(request.headers.get("authorization"), password)) {
    return new NextResponse("This is the ChemLife staging site. Please sign in.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="ChemLife staging", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const response = localeRouting(request);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function localeRouting(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // API routes and the share image aren't pages; /_... are Next.js internals.
  if (pathname.startsWith("/api/") || pathname.startsWith("/opengraph-image") || pathname.startsWith("/_")) {
    return NextResponse.next();
  }
  // The Insights inbox (src/app/admin): English only, and never in search results.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  const first = pathname.split("/")[1] ?? "";
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) return NextResponse.next();
  const wanted = languageFor(request);
  if (wanted !== DEFAULT_LOCALE && isTranslatedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(pathname, wanted);
    const response = NextResponse.redirect(url, 307);
    // The answer depends on this visitor's browser and cookie, so no shared cache may keep it.
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

// Crawlers see every language at its own address (the hreflang links), so they're never redirected.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse/i;

function languageFor(request: NextRequest) {
  const picked = request.cookies.get(LOCALE_COOKIE)?.value ?? "";
  if (isLocale(picked)) return picked;
  if (request.method !== "GET" || BOT.test(request.headers.get("user-agent") ?? "")) return DEFAULT_LOCALE;
  return preferredLocale(request.headers.get("accept-language"));
}

// Browser sign-in prompt: any user name, only the password is checked.
function hasPassword(header: string | null, password: string) {
  if (!header?.startsWith("Basic ")) return false;
  const credentials = Buffer.from(header.slice(6), "base64").toString("utf8");
  const given = Buffer.from(credentials.slice(credentials.indexOf(":") + 1));
  const expected = Buffer.from(password);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const config = {
  // Pages and API routes. Files with an extension, built assets and resized images are skipped: they're public
  // on the live site anyway, and the image optimizer's internal requests carry no password.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
