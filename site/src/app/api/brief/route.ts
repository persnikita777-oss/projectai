import { NextResponse } from "next/server"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const CHAT_ID = process.env.ADMIN_ID

const serviceLabels: Record<string, string> = {
  chatbot: "AI чат-бот",
  website: "Сайт + AI",
  assistant: "AI-ассистент",
  automation: "Автоматизация",
  integration: "Интеграция AI",
  consulting: "AI-консалтинг",
  other: "Другое",
}

const budgetLabels: Record<string, string> = {
  under30: "до 30 000 ₽",
  "30-70": "30 000 – 70 000 ₽",
  "70-150": "70 000 – 150 000 ₽",
  "150plus": "от 150 000 ₽",
  unknown: "Не определился",
}

const timelineLabels: Record<string, string> = {
  asap: "Как можно скорее",
  week: "В течение недели",
  month: "В течение месяца",
  planning: "Планирую на будущее",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { services, description, budget, timeline, name, company, telegram, email } = body

    if (!name || !telegram || !services?.length) {
      return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 })
    }

    const serviceList = (services as string[])
      .map((s) => serviceLabels[s] || s)
      .join(", ")

    const lines = [
      "📋 <b>Новая заявка (бриф)</b>",
      "",
      `<b>Услуги:</b> ${escapeHtml(serviceList)}`,
    ]

    if (description) {
      lines.push(`<b>Описание:</b> ${escapeHtml(description)}`)
    }
    if (budget) {
      lines.push(`<b>Бюджет:</b> ${budgetLabels[budget] || budget}`)
    }
    if (timeline) {
      lines.push(`<b>Сроки:</b> ${timelineLabels[timeline] || timeline}`)
    }

    lines.push("")
    lines.push(`<b>Имя:</b> ${escapeHtml(name)}`)
    if (company) {
      lines.push(`<b>Компания:</b> ${escapeHtml(company)}`)
    }
    lines.push(`<b>Telegram:</b> ${escapeHtml(telegram)}`)
    if (email) {
      lines.push(`<b>Email:</b> ${escapeHtml(email)}`)
    }

    await sendTelegram(lines.join("\n"))

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 })
  }
}

async function sendTelegram(text: string) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  })
  if (!res.ok) {
    throw new Error(`Telegram API error: ${res.status}`)
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
