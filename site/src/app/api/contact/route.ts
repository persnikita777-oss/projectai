import { NextResponse } from "next/server"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const CHAT_ID = process.env.ADMIN_ID

export async function POST(request: Request) {
  try {
    const { name, contact, message } = await request.json()

    if (!name || !contact || !message) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 })
    }

    const text = [
      "📩 <b>Новое сообщение с сайта</b>",
      "",
      `<b>Имя:</b> ${escapeHtml(name)}`,
      `<b>Контакт:</b> ${escapeHtml(contact)}`,
      "",
      `<b>Сообщение:</b>`,
      escapeHtml(message),
    ].join("\n")

    await sendTelegram(text)

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
