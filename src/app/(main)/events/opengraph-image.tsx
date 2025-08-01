import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Events - Kick Back";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
        
        {/* Event icon */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            📅
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "white",
            margin: "0 0 20px 0",
            textAlign: "center",
            textShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          Events
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 40px 0",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.4",
          }}
        >
          Discover and join amazing events with friends
        </p>

        {/* Event types */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "24px",
            }}
          >
            <span>🎉</span>
            <span>Parties</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "24px",
            }}
          >
            <span>🍽️</span>
            <span>Dinners</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "rgba(255,255,255,0.8)",
              fontSize: "24px",
            }}
          >
            <span>🎮</span>
            <span>Games</span>
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
} 