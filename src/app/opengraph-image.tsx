import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Tirtha Atlas of India";
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
      Tirtha Atlas of India
    </div>,
    size,
  );
}
