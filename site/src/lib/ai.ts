const OPENAI_API = "https://api.openai.com/v1/chat/completions"

interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function callAI(messages: AIMessage[], options?: { maxTokens?: number; temperature?: number }): Promise<string> {
  const res = await fetch(OPENAI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.4,
    }),
  })

  if (!res.ok) throw new Error(`AI API error: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ""
}

// Pricing logic from PROJECT.md
const BASE_PRICES: Record<string, number> = {
  chatbot: 30000,
  website: 20000,
  assistant: 70000,
  automation: 100000,
  integration: 50000,
  consulting: 10000,
}

const SERVICE_LABELS: Record<string, string> = {
  chatbot: "AI чат-бот",
  website: "Сайт + AI",
  assistant: "AI-ассистент (RAG)",
  automation: "Автоматизация процессов",
  integration: "Интеграция AI",
  consulting: "AI-консалтинг",
}

export { BASE_PRICES, SERVICE_LABELS }
