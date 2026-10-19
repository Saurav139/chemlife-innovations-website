import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { isStagingHost } from "@/lib/seo";

// The staging site (any address other than the live domain) is kept out of search results, and asks for a
// password when STAGING_PASSWORD is set in its environment. The live site passes straight through.
export function proxy(request: NextRequest) {
  // Only the Host header: the server routes requests by it, so it can't be faked to look like the live site.
  if (!isStagingHost(request.headers.get("host") ?? "")) return NextResponse.next();

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

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
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
