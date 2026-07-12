import { ImageResponse } from "next/og";

// Favicon generated at build time — vermilion "999" on warm ink, matching the
// editorial design system.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b1a16",
          color: "#d4371b",
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        999
      </div>
    ),
    { ...size },
  );
}
