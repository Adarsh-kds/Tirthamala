import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site-config";

export const dynamic = "force-static";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#5a1420",
        color: "#f6ecd6",
        fontSize: 72,
      }}
    >
      {SITE_NAME}
    </div>,
    size,
  );
}
