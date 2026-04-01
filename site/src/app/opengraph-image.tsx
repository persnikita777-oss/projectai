import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "ProjectAI — AI-разработка в 5 раз дешевле"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          <span style={{ color: "#3b82f6" }}>Project</span>
          <span>AI</span>
        </div>
        <div
          style={{
            fontSize: "36px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          AI-разработка для бизнеса в 5 раз дешевле рынка
        </div>
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "40px",
            fontSize: "20px",
            color: "#64748b",
          }}
        >
          <span>Чат-боты</span>
          <span>•</span>
          <span>AI-ассистенты</span>
          <span>•</span>
          <span>Автоматизация</span>
          <span>•</span>
          <span>Сайты</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
