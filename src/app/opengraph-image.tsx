import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Impostor Chile - Jugar impostor gratis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 16,
          }}
        >
          Impostor Chile
        </div>
        <div style={{ fontSize: 28, color: "#94a3b8", marginBottom: 8 }}>
          Jugar impostor gratis
        </div>
        <div style={{ fontSize: 20, color: "#64748b" }}>
          Sin publicidad · Sin registro · elimpostor.cl
        </div>
      </div>
    ),
    { ...size }
  );
}
