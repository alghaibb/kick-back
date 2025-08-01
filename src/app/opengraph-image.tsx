import { ImageResponse } from "next/og";
import { env } from "@/lib/env";

export const runtime = "edge";
export const alt =
  "Kick Back - Organize and join events with friends and family";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

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
          position: "relative",
          backgroundImage: `url('${env.NEXT_PUBLIC_BASE_URL}/dashboard-dark.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for better text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            zIndex: 10,
            padding: "40px",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              KB
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              margin: "0 0 20px 0",
              textShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            Kick Back
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "32px",
              color: "#e2e8f0",
              margin: "0 0 40px 0",
              maxWidth: "800px",
              lineHeight: 1.2,
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Plan, Connect, Celebrate
          </p>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#94a3b8",
                fontSize: "20px",
              }}
            >
              <span style={{ fontSize: "24px" }}>🎉</span>
              <span>Events</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#94a3b8",
                fontSize: "20px",
              }}
            >
              <span style={{ fontSize: "24px" }}>👥</span>
              <span>Groups</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#94a3b8",
                fontSize: "20px",
              }}
            >
              <span style={{ fontSize: "24px" }}>🔔</span>
              <span>Reminders</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
