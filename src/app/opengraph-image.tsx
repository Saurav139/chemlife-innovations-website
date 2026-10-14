import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Share-preview image for every page (WhatsApp, LinkedIn, X, search). Generated once at build time.
// Pages other than the homepage reference it through SHARE_IMAGE in src/lib/seo.ts.
export const alt = "ChemLife Innovations: nature-driven functional feed additives";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [logo, mavenMedium, mavenBold] = await Promise.all([
    readFile(join(process.cwd(), "public/images/branding/logo.jpg")),
    readFile(join(process.cwd(), "src/assets/fonts/maven-pro-latin-500-normal.woff")),
    readFile(join(process.cwd(), "src/assets/fonts/maven-pro-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#15273F",
          fontFamily: "Maven Pro",
        }}
      >
        {/* Same teal-to-orange bar as the site footer */}
        <div style={{ display: "flex", height: 10, backgroundImage: "linear-gradient(90deg, #14B8A6, #10B981, #E65C38)" }} />

        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 80px" }}>
          <img
            src={`data:image/jpeg;base64,${logo.toString("base64")}`}
            width={340}
            height={340}
            style={{ borderRadius: 32, flexShrink: 0 }}
            alt=""
          />

          {/* 1200 - 2 × 80 padding - 340 logo - 64 gap */}
          <div style={{ display: "flex", flexDirection: "column", width: 636, marginLeft: 64 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: "#2DD4BF", textTransform: "uppercase" }}>
              Functional feed additives
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, color: "#FFFFFF", marginTop: 18 }}>
              Goodness of nature through an Ayurvedic holistic approach
            </div>
            <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.35, color: "#B8C7D9", marginTop: 24 }}>
              For poultry, dairy and livestock, made with ANBioT bio-transformation technology
            </div>
          </div>
        </div>

        <div style={{ display: "flex", padding: "0 80px 40px", fontSize: 22, fontWeight: 500, color: "#8EA3BC" }}>
          chemlifeinnovations.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Maven Pro", data: mavenMedium, weight: 500, style: "normal" },
        { name: "Maven Pro", data: mavenBold, weight: 700, style: "normal" },
      ],
    },
  );
}
