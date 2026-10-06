import { ImageResponse } from "next/og";
import { getSite, getSites } from "@/lib/data";

export const dynamic = "force-static";
export const dynamicParams = false;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = () => getSites().map((s) => ({ slug: s.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSite(slug);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#f7efdc",
        color: "#6b1220",
        fontFamily: "serif",
      }}
    >
      <div style={{ fontSize: 28, color: "#5b4034" }}>Tirthamala</div>
      <div style={{ fontSize: 88, fontWeight: 600, marginTop: 24 }}>{s?.name ?? slug}</div>
      <div style={{ fontSize: 34, color: "#5b4034", marginTop: 24 }}>
        {[s?.location.city, s?.location.state].filter(Boolean).join(", ")}
      </div>
    </div>,
    size,
  );
}
