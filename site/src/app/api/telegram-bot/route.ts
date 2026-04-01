import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

// Telegram Bot Webhook — обработка /start
export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update?.message

    if (!message?.text) return NextResponse.json({ ok: true })

    const chatId = message.chat.id
    const username = message.from?.username
    const text = message.text.trim()

    // Handle /start
    if (text === "/start" || text.startsWith("/start")) {
      if (!username) {
        await sendMessage(chatId, "Для работы с ботом установите username в настройках Telegram.")
        return NextResponse.json({ ok: true })
      }

      // Normalize: remove @ if present
      const tgHandle = username.toLowerCase()

      // Find client by telegram username
      const { data: client } = await supabaseAdmin
        .from("pai_clients")
        .select("id, auth_id, name, email")
        .or(`telegram.ilike.@${tgHandle},telegram.ilike.${tgHandle}`)
        .single()

      if (!client || !client.email) {
        await sendMessage(
          chatId,
          "👋 Привет! Я бот ProjectAI.\n\n" +
          "Чтобы получить доступ к личному кабинету, сначала оставьте заявку на сайте:\n" +
          "🔗 https://projektai.ru/brief\n\n" +
          "После заявки нажмите /start снова — я пришлю логин и пароль."
        )
        if (client) {
          await supabaseAdmin
            .from("pai_clients")
            .update({ phone: String(chatId) })
            .eq("id", client.id)
        }
        return NextResponse.json({ ok: true })
      }

      const password = generatePassword()

      if (client.auth_id) {
        // Auth user exists — update password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          client.auth_id,
          { password }
        )
        if (updateError) {
          await sendMessage(chatId, "Произошла ошибка. Попробуйте позже или обратитесь в поддержку.")
          return NextResponse.json({ ok: true })
        }
      } else {
        // No auth user yet — create one
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: client.email,
          password,
          email_confirm: true,
          user_metadata: { name: client.name },
        })

        if (createError) {
          // Maybe user exists in auth but not linked
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
          const existing = existingUsers?.users?.find((u) => u.email === client.email)
          if (existing) {
            // Link and update password
            await supabaseAdmin.auth.admin.updateUserById(existing.id, { password })
            await supabaseAdmin
              .from("pai_clients")
              .update({ auth_id: existing.id, phone: String(chatId), updated_at: new Date().toISOString() })
              .eq("id", client.id)
          } else {
            await sendMessage(chatId, "Произошла ошибка создания аккаунта. Обратитесь в поддержку.")
            return NextResponse.json({ ok: true })
          }
        } else if (newUser) {
          // Link auth to client
          await supabaseAdmin
            .from("pai_clients")
            .update({ auth_id: newUser.user.id, updated_at: new Date().toISOString() })
            .eq("id", client.id)
        }
      }

      // Save chat_id in phone field for future Telegram notifications
      await supabaseAdmin
        .from("pai_clients")
        .update({ phone: String(chatId), updated_at: new Date().toISOString() })
        .eq("id", client.id)

      // Send credentials
      await sendMessage(
        chatId,
        `👋 ${client.name}, ваш аккаунт готов!\n\n` +
        `🔑 <b>Данные для входа:</b>\n` +
        `Логин: <code>${client.email}</code>\n` +
        `Пароль: <code>${password}</code>\n\n` +
        `🔗 <a href="https://projektai.ru/login">Войти в личный кабинет</a>\n\n` +
        `Там вы сможете отслеживать статус проектов, редактировать ТЗ и утверждать предложения.`
      )

      return NextResponse.json({ ok: true })
    }

    // Handle /status — show active projects
    if (text === "/status") {
      if (!username) {
        await sendMessage(chatId, "Установите username в Telegram для работы с ботом.")
        return NextResponse.json({ ok: true })
      }

      const tgHandle = username.toLowerCase()
      const { data: client } = await supabaseAdmin
        .from("pai_clients")
        .select("id")
        .or(`telegram.ilike.@${tgHandle},telegram.ilike.${tgHandle}`)
        .single()

      if (!client) {
        await sendMessage(chatId, "Вы ещё не зарегистрированы. Оставьте заявку: https://projektai.ru/brief")
        return NextResponse.json({ ok: true })
      }

      const { data: projects } = await supabaseAdmin
        .from("pai_projects")
        .select("title, status, created_at")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!projects || projects.length === 0) {
        await sendMessage(chatId, "У вас пока нет проектов. Оставьте заявку: https://projektai.ru/brief")
        return NextResponse.json({ ok: true })
      }

      const statusEmoji: Record<string, string> = {
        brief: "📝", tz: "📋", proposal: "💰", approved: "✅",
        development: "⚙️", review: "🔍", done: "🎯", cancelled: "❌",
      }

      const statusLabel: Record<string, string> = {
        brief: "Бриф", tz: "Составление ТЗ", proposal: "КП готово",
        approved: "Утверждён", development: "В разработке", review: "На проверке",
        done: "Готов", cancelled: "Отменён",
      }

      const lines = ["📊 <b>Ваши проекты:</b>\n"]
      for (const p of projects) {
        const emoji = statusEmoji[p.status] || "📁"
        const label = statusLabel[p.status] || p.status
        lines.push(`${emoji} <b>${p.title}</b> — ${label}`)
      }
      lines.push(`\n🔗 <a href="https://projektai.ru/dashboard">Открыть личный кабинет</a>`)

      await sendMessage(chatId, lines.join("\n"))
      return NextResponse.json({ ok: true })
    }

    // Default response
    await sendMessage(
      chatId,
      "Команды:\n/start — получить логин и пароль от ЛК\n/status — статус проектов\n\n🔗 https://projektai.ru"
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Bot error:", e)
    return NextResponse.json({ ok: true })
  }
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let result = ""
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  })
}
