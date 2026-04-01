import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

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

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { services, description, budget, timeline, name, company, telegram, email, estimate } = body

    if (!name || !telegram || !email || !services?.length) {
      return NextResponse.json({ error: "Заполните обязательные поля (имя, telegram, email, услуги)" }, { status: 400 })
    }

    const serviceList = (services as string[])
      .map((s) => serviceLabels[s] || s)
      .join(", ")

    // 1. Find or create Supabase Auth user
    let authId: string | null = null
    let password: string | null = null
    let isNewUser = false

    // Check if auth user exists by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      authId = existingUser.id
    } else {
      // Create new auth user with generated password
      password = generatePassword()
      const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })

      if (authError) {
        console.error("Auth error:", authError)
        return NextResponse.json({ error: "Ошибка создания аккаунта" }, { status: 500 })
      }

      authId = newUser.user.id
      isNewUser = true
    }

    // 2. Find or create pai_client linked to auth_id
    let clientId: string | null = null

    const { data: existingClient } = await supabaseAdmin
      .from("pai_clients")
      .select("id")
      .eq("auth_id", authId)
      .single()

    if (existingClient) {
      clientId = existingClient.id
      // Update contact info
      await supabaseAdmin
        .from("pai_clients")
        .update({ name, company, telegram, email, updated_at: new Date().toISOString() })
        .eq("id", clientId)
    } else {
      // Also check by email/telegram (may have been created without auth_id)
      const { data: byEmail } = await supabaseAdmin
        .from("pai_clients")
        .select("id")
        .eq("email", email)
        .single()

      if (byEmail) {
        clientId = byEmail.id
        // Link to auth_id
        await supabaseAdmin
          .from("pai_clients")
          .update({ auth_id: authId, name, company, telegram, updated_at: new Date().toISOString() })
          .eq("id", clientId)
      } else {
        const { data: newClient } = await supabaseAdmin
          .from("pai_clients")
          .insert({ auth_id: authId, name, company, telegram, email })
          .select("id")
          .single()
        clientId = newClient?.id || null
      }
    }

    // 3. Create project for EACH selected service
    const projectIds: string[] = []
    const estimateAmount = estimate ? parseInt(estimate, 10) : null

    for (const serviceId of services as string[]) {
      const serviceLabel = serviceLabels[serviceId] || serviceId
      const { data: project } = await supabaseAdmin
        .from("pai_projects")
        .insert({
          client_id: clientId,
          title: serviceLabel,
          service_type: serviceId,
          description,
          budget_range: budget ? budgetLabels[budget] || budget : null,
          timeline: timeline ? timelineLabels[timeline] || timeline : null,
          estimate_amount: estimateAmount,
          status: "brief",
        })
        .select("id")
        .single()

      if (project) projectIds.push(project.id)
    }

    // 4. Telegram notification to admin
    const lines = [
      "📋 <b>Новая заявка</b>",
      "",
      `<b>Услуги:</b> ${escapeHtml(serviceList)}`,
    ]

    if (description) lines.push(`<b>Описание:</b> ${escapeHtml(description)}`)
    if (budget) lines.push(`<b>Бюджет:</b> ${budgetLabels[budget] || budget}`)
    if (timeline) lines.push(`<b>Сроки:</b> ${timelineLabels[timeline] || timeline}`)
    if (estimate) lines.push(`<b>Оценка:</b> от ${parseInt(estimate, 10).toLocaleString("ru-RU")} ₽`)

    lines.push("")
    lines.push(`<b>Имя:</b> ${escapeHtml(name)}`)
    if (company) lines.push(`<b>Компания:</b> ${escapeHtml(company)}`)
    lines.push(`<b>Telegram:</b> ${escapeHtml(telegram)}`)
    lines.push(`<b>Email:</b> ${escapeHtml(email)}`)
    lines.push(`<b>Проектов:</b> ${projectIds.length}`)
    if (isNewUser) lines.push(`\n🔑 Новый аккаунт создан`)

    await sendTelegram(lines.join("\n"))

    // 5. Return credentials for new users
    return NextResponse.json({
      ok: true,
      projectIds,
      credentials: isNewUser && password ? { email, password } : null,
    })
  } catch (e) {
    console.error("Brief error:", e)
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 })
  }
}

async function sendTelegram(text: string) {
  if (!CHAT_ID) return
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    })
  } catch { /* silent */ }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
