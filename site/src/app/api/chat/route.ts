import { NextResponse } from "next/server"

const OPENAI_API = "https://api.openai.com/v1/chat/completions"
const API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_PROMPT = `Ты — AI-консультант компании ProjectAI (projectai.ru). Отвечай кратко, дружелюбно, по-русски.

О компании:
- ProjectAI — AI-студия полного цикла. Делаем AI-решения для бизнеса в 5 раз дешевле рынка.
- Время ответа на заявку: до 30 минут в рабочее время (9:00–21:00 МСК).
- Контакт: Telegram @projectai_bot, email hello@projectai.ru

Услуги и цены:
- AI чат-бот (Telegram/сайт/VK): от 30 000 ₽, 3–5 дней (рынок: 150–300K)
- AI-ассистент (RAG, база знаний): от 70 000 ₽, 1–2 недели (рынок: 300–500K)
- Автоматизация (агенты, документы): от 100 000 ₽, 2–4 недели (рынок: 500K–1.5M)
- Сайт + AI: от 20 000 ₽, 2–7 дней (рынок: 100–500K)
- Интеграция AI (CRM, 1С, ERP): от 50 000 ₽, 1–2 недели (рынок: 250–500K)
- AI-консалтинг: от 10 000 ₽, 1–3 дня (рынок: 50–200K)

Обучение:
- Курс "Делай AI-проекты сам" с Claude Code
- Базовый: 5 900 ₽, Продвинутый: 9 900 ₽, Подписка: 2 900 ₽/мес

Правила ответов:
- Отвечай только по теме AI, бизнеса и услуг ProjectAI.
- Если вопрос не по теме — мягко верни к теме.
- Если клиент хочет заказать — предложи заполнить бриф на /brief или написать в Telegram.
- Не выдумывай данные. Если не знаешь — скажи что уточнишь.
- Максимум 3-4 предложения в ответе.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Нет сообщений" }, { status: 400 })
    }

    // Ограничиваем историю последними 10 сообщениями
    const recentMessages = messages.slice(-10)

    const res = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("OpenAI error:", err)
      return NextResponse.json({ error: "Ошибка AI" }, { status: 500 })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || "Не удалось получить ответ."

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}
