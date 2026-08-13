import { ImageResponse } from "next/og";

export const alt =
  "SamadhiRice.lk — heritage Sri Lankan rice from the paddy field to your plate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#172410",
          color: "#fffaf0",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 82% 18%, rgba(218,169,70,.32), transparent 30%), linear-gradient(145deg, #172410 0%, #314327 58%, #77723a 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -150,
            width: 620,
            height: 620,
            display: "flex",
            borderRadius: "50%",
            border: "2px solid rgba(235,196,113,.35)",
          }}
        />
        <div
          style={{
            width: "100%",
            padding: "78px 86px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#e6bd69",
              fontFamily: "sans-serif",
              fontSize: 24,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            Heritage rice · Sri Lanka
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                maxWidth: 880,
                fontSize: 78,
                lineHeight: 1.03,
                letterSpacing: -3,
              }}
            >
              From the paddy field to your plate.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 30,
                color: "rgba(255,250,240,.76)",
                fontFamily: "sans-serif",
                fontSize: 27,
              }}
            >
              Suwandel · Kalu Heenati · Red rice · Keeri Samba
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "sans-serif",
              fontSize: 31,
              fontWeight: 700,
            }}
          >
            <span>Samadhi</span>
            <span style={{ color: "#e6bd69", marginLeft: -14 }}>Rice</span>
            <span style={{ opacity: 0.55, marginLeft: -14 }}>.lk</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
