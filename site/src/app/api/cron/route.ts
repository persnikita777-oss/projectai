import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { callAI, SERVICE_LABELS } from "@/lib/ai"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const ADMIN_CHAT = process.env.ADMIN_ID
const CRON_SECRET = process.env.CRON_SECRET || process.env.QSTASH_TOKEN || process.env.SUPABASE_SERVICE_KEY

// Cron: автоматическая обработка проектов и задач
// Вызывается QStash каждые 5 минут или вручную
export async function POST(req: NextRequest) {
  // Auth: QStash signature или Bearer token
  const auth = req.headers.get("authorization")
  const upstashSig = req.headers.get("upstash-signature")

  if (!upstashSig && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: string[] = []

  // 1. Auto-generate TZ for new briefs (status = "brief")
  const { data: newBriefs } = await supabaseAdmin
    .from("pai_projects")
    .select("*")
    .eq("status", "brief")
    .order("created_at", { ascending: true })
    .limit(3)

  for (const project of newBriefs || []) {
    try {
      const serviceLabel = SERVICE_LABELS[project.service_type] || project.service_type
      const tz = await callAI([
        { role: "system", content: "Ты технический аналитик AI-студии. Составь детальное ТЗ. Русский." },
        { role: "user", content: `Составь ТЗ:\nУслуга: ${serviceLabel}\nПлатформа: ${project.platform || "не указана"}\nИнтеграции: ${project.integrations?.join(", ") || "нет"}\nОписание: ${project.description || "не указано"}\nБюджет: ${project.budget_range || "не указан"}\n\nРазделы: Цель, Функциональные требования, Стек, Интеграции, НФТ, Этапы, Критерии приёмки.` },
      ], { maxTokens: 3000 })

      await supabaseAdmin.from("pai_projects").update({
        tz_text: tz,
        status: "tz",
        updated_at: new Date().toISOString(),
      }).eq("id", project.id)

      results.push(`TZ: ${project.title}`)
      await notify(`📋 ТЗ автогенерация: "${project.title}"`)
    } catch (e) {
      results.push(`TZ ERROR: ${project.title}: ${e}`)
    }
  }

  // 2. КП НЕ генерируется автоматически — клиент сначала редактирует ТЗ,
  //    потом нажимает «ТЗ готово → получить КП» в ЛК

  // 3. Process next pending task in active projects (status = "development")
  const { data: devProjects } = await supabaseAdmin
    .from("pai_projects")
    .select("id, title")
    .eq("status", "development")
    .limit(5)

  for (const project of devProjects || []) {
    // Find first pending task (no in_progress tasks should exist)
    const { data: inProgress } = await supabaseAdmin
      .from("pai_tasks")
      .select("id")
      .eq("project_id", project.id)
      .eq("status", "in_progress")
      .limit(1)

    if (inProgress && inProgress.length > 0) continue // Already working

    const { data: nextTask } = await supabaseAdmin
      .from("pai_tasks")
      .select("*")
      .eq("project_id", project.id)
      .eq("status", "pending")
      .order("sort_order", { ascending: true })
      .limit(1)
      .single()

    if (!nextTask) {
      // All tasks done → check if auto-deploy configured
      const { data: settings } = await supabaseAdmin
        .from("pai_project_settings")
        .select("*")
        .eq("project_id", project.id)
        .single()

      await supabaseAdmin.from("pai_projects").update({
        status: "review",
        updated_at: new Date().toISOString(),
      }).eq("id", project.id)

      results.push(`REVIEW: ${project.title}`)

      if (settings && settings.deploy_status === "pending" && (settings.github_repo || settings.domain)) {
        await notify(`🔍 Все задачи выполнены: "${project.title}" → готов к деплою\nНастройки деплоя заполнены — клиент может запустить деплой в ЛК`)
      } else {
        await notify(`🔍 Все задачи выполнены: "${project.title}" → на проверке`)
      }
      continue
    }

    // Mark task in_progress
    await supabaseAdmin.from("pai_tasks").update({
      status: "in_progress",
    }).eq("id", nextTask.id)

    // Execute task via AI
    try {
      const result = await callAI([
        { role: "system", content: "Ты senior full-stack разработчик AI-студии ProjectAI. Выполни задачу и опиши результат кратко. Если нужен код — приведи ключевые фрагменты. Русский." },
        { role: "user", content: `Задача: ${nextTask.title}\nОписание: ${nextTask.description}\n\nОпиши что сделано, какие файлы затронуты, ключевые решения.` },
      ], { maxTokens: 1500 })

      await supabaseAdmin.from("pai_tasks").update({
        status: "done",
        result,
        completed_at: new Date().toISOString(),
      }).eq("id", nextTask.id)

      // Count progress
      const { count: doneCount } = await supabaseAdmin.from("pai_tasks").select("id", { count: "exact", head: true }).eq("project_id", project.id).eq("status", "done")
      const { count: totalCount } = await supabaseAdmin.from("pai_tasks").select("id", { count: "exact", head: true }).eq("project_id", project.id)

      results.push(`TASK: ${nextTask.title}`)
      await notify(`✅ Задача ${doneCount}/${totalCount}: "${nextTask.title}"\nПроект: ${project.title}`)
    } catch (e) {
      await supabaseAdmin.from("pai_tasks").update({
        status: "blocked",
        result: `Ошибка: ${e}`,
      }).eq("id", nextTask.id)
      results.push(`TASK ERROR: ${nextTask.title}`)
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  })
}

// GET — health check
export async function GET() {
  const { count: briefs } = await supabaseAdmin.from("pai_projects").select("id", { count: "exact", head: true }).eq("status", "brief")
  const { count: dev } = await supabaseAdmin.from("pai_projects").select("id", { count: "exact", head: true }).eq("status", "development")
  const { count: pendingTasks } = await supabaseAdmin.from("pai_tasks").select("id", { count: "exact", head: true }).eq("status", "pending")

  return NextResponse.json({
    status: "ok",
    queue: { briefs, development: dev, pending_tasks: pendingTasks },
    timestamp: new Date().toISOString(),
  })
}

async function notify(text: string) {
  if (!ADMIN_CHAT) return
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_CHAT, text, parse_mode: "HTML" }),
    })
  } catch { /* silent */ }
}
