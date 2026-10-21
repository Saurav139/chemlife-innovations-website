import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isStagingHost } from "@/lib/seo";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";

// Every page lives under src/app/[locale]. English keeps its plain addresses: /products is served from
// /en/products behind the scenes, and /en/products redirects to /products. /kn/... and /hi/... pass through.
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
  const first = pathname.split("/")[1] ?? "";
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
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
