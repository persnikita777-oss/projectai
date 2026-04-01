import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { callAI, SERVICE_LABELS } from "@/lib/ai"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const ADMIN_CHAT = process.env.ADMIN_ID
const AGENT_SECRET = process.env.AGENT_SECRET || process.env.SUPABASE_SERVICE_KEY

// Agent API — вызывается из Telegram-бота или cron
// Авторизация: Bearer token = AGENT_SECRET
export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${AGENT_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action, projectId, taskId, data } = await req.json()

  switch (action) {
    // --- Project lifecycle ---
    case "list-projects":
      return listProjects(data?.status)

    case "get-project":
      return getProject(projectId)

    case "generate-tz":
      return generateTZForProject(projectId)

    case "generate-proposal":
      return generateProposalForProject(projectId)

    case "approve-project":
      return approveProject(projectId)

    // --- Task management ---
    case "list-tasks":
      return listTasks(projectId)

    case "start-task":
      return updateTaskStatus(taskId, "in_progress")

    case "complete-task":
      return completeTask(taskId, data?.result)

    case "block-task":
      return updateTaskStatus(taskId, "blocked", data?.reason)

    // --- Development tools ---
    case "scaffold":
      return scaffoldProject(projectId, data)

    case "update-project-status":
      return updateProjectStatus(projectId, data?.status)

    // --- Deploy ---
    case "get-settings":
      return getProjectSettings(projectId)

    case "save-settings":
      return saveProjectSettings(projectId, data)

    case "deploy-project":
      return deployProject(projectId)

    // --- Documentation ---
    case "generate-docs":
      return generateDocs(projectId, data?.type)

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }
}

// --- Implementations ---

async function listProjects(status?: string) {
  let query = supabaseAdmin.from("pai_projects").select("id, title, status, service_type, created_at").order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data } = await query
  return NextResponse.json({ projects: data || [] })
}

async function getProject(id: string) {
  const { data } = await supabaseAdmin.from("pai_projects").select("*, pai_tasks(*)").eq("id", id).single()
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}

async function generateTZForProject(id: string) {
  const { data: project } = await supabaseAdmin.from("pai_projects").select("*").eq("id", id).single()
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const serviceLabel = SERVICE_LABELS[project.service_type] || project.service_type

  const tz = await callAI([
    { role: "system", content: "Ты технический аналитик AI-студии. Составь детальное ТЗ. Русский язык." },
    { role: "user", content: `Составь ТЗ для проекта:
Услуга: ${serviceLabel}
Платформа: ${project.platform || "не указана"}
Интеграции: ${project.integrations?.join(", ") || "нет"}
Описание: ${project.description || "не указано"}
Бюджет: ${project.budget_range || "не указан"}

Разделы: Цель, Функциональные требования, Стек, Интеграции, НФТ, Этапы и сроки, Критерии приёмки.` },
  ], { maxTokens: 3000 })

  await supabaseAdmin.from("pai_projects").update({ tz_text: tz, status: "tz", updated_at: new Date().toISOString() }).eq("id", id)
  await notify(`📋 ТЗ: "${project.title}"`)
  return NextResponse.json({ ok: true, tz })
}

async function generateProposalForProject(id: string) {
  const { data: project } = await supabaseAdmin.from("pai_projects").select("*").eq("id", id).single()
  if (!project || !project.tz_text) return NextResponse.json({ error: "Нет ТЗ" }, { status: 400 })

  const estimate = project.estimate_amount || 50000
  const proposal = await callAI([
    { role: "system", content: "Ты коммерческий директор AI-студии. Составь КП. Русский." },
    { role: "user", content: `ТЗ:\n${project.tz_text}\n\nОценка: от ${estimate.toLocaleString("ru-RU")} ₽\nСоставь КП: что входит, стоимость, сроки, этапы оплаты, гарантии.` },
  ], { maxTokens: 2000 })

  const priceMatch = proposal.match(/(\d[\d\s]*\d)\s*₽/)
  const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ""), 10) : estimate

  await supabaseAdmin.from("pai_projects").update({ proposal_text: proposal, proposal_price: price, status: "proposal", updated_at: new Date().toISOString() }).eq("id", id)
  await notify(`💰 КП: "${project.title}" — ${price.toLocaleString("ru-RU")} ₽`)
  return NextResponse.json({ ok: true, proposal, price })
}

async function approveProject(id: string) {
  const { data: project } = await supabaseAdmin.from("pai_projects").select("*").eq("id", id).single()
  if (!project || !project.tz_text) return NextResponse.json({ error: "Нет ТЗ" }, { status: 400 })

  const tasksRaw = await callAI([
    { role: "system", content: "Верни ТОЛЬКО JSON-массив задач. Без markdown." },
    { role: "user", content: `Разбей ТЗ на задачи:\n${project.tz_text}\n\nФормат: [{"title":"...","description":"..."}]` },
  ], { maxTokens: 2000, temperature: 0.3 })

  let tasks: { title: string; description: string }[]
  try {
    tasks = JSON.parse(tasksRaw.replace(/```json?\n?/g, "").replace(/```/g, "").trim())
  } catch {
    return NextResponse.json({ error: "Parse error", raw: tasksRaw }, { status: 500 })
  }

  await supabaseAdmin.from("pai_tasks").insert(tasks.map((t, i) => ({
    project_id: id, title: t.title, description: t.description, sort_order: i, status: "pending",
  })))

  await supabaseAdmin.from("pai_projects").update({
    status: "development",
    dev_plan: tasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n"),
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  await notify(`✅ "${project.title}" утверждён, ${tasks.length} задач создано`)
  return NextResponse.json({ ok: true, count: tasks.length })
}

async function listTasks(projectId: string) {
  const { data } = await supabaseAdmin.from("pai_tasks").select("*").eq("project_id", projectId).order("sort_order")
  return NextResponse.json({ tasks: data || [] })
}

async function updateTaskStatus(taskId: string, status: string, reason?: string) {
  const update: Record<string, unknown> = { status, ...(status === "done" ? { completed_at: new Date().toISOString() } : {}) }
  if (reason) update.result = reason
  await supabaseAdmin.from("pai_tasks").update(update).eq("id", taskId)
  return NextResponse.json({ ok: true })
}

async function completeTask(taskId: string, result?: string) {
  await supabaseAdmin.from("pai_tasks").update({
    status: "done",
    result: result || "Выполнено",
    completed_at: new Date().toISOString(),
  }).eq("id", taskId)

  // Check if all tasks done → update project status
  const { data: task } = await supabaseAdmin.from("pai_tasks").select("project_id").eq("id", taskId).single()
  if (task) {
    const { data: remaining } = await supabaseAdmin.from("pai_tasks").select("id").eq("project_id", task.project_id).neq("status", "done")
    if (remaining?.length === 0) {
      await supabaseAdmin.from("pai_projects").update({ status: "review", updated_at: new Date().toISOString() }).eq("id", task.project_id)
      await notify(`🔍 Все задачи выполнены, проект на проверке`)
    }
  }

  return NextResponse.json({ ok: true })
}

async function updateProjectStatus(id: string, status: string) {
  if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 })
  await supabaseAdmin.from("pai_projects").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
  return NextResponse.json({ ok: true })
}

async function scaffoldProject(projectId: string, data?: Record<string, unknown>) {
  const { data: project } = await supabaseAdmin.from("pai_projects").select("*").eq("id", projectId).single()
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const scaffold = await callAI([
    { role: "system", content: "Ты senior full-stack разработчик. Создай структуру проекта. Русский." },
    { role: "user", content: `На основе ТЗ предложи структуру проекта:
${project.tz_text || project.description}

Стек: ${data?.stack || "Next.js + Supabase + Vercel"}

Верни:
1. Структуру файлов (дерево)
2. package.json зависимости
3. Схему БД (SQL)
4. Список API endpoints
5. .env.example` },
  ], { maxTokens: 3000 })

  return NextResponse.json({ ok: true, scaffold })
}

async function generateDocs(projectId: string, type?: string) {
  const { data: project } = await supabaseAdmin.from("pai_projects").select("*").eq("id", projectId).single()
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const docType = type || "readme"
  const prompts: Record<string, string> = {
    readme: `Создай README.md для проекта на основе ТЗ:\n${project.tz_text}`,
    api: `Создай документацию API endpoints на основе ТЗ:\n${project.tz_text}`,
    architecture: `Опиши архитектуру проекта на основе ТЗ:\n${project.tz_text}\nВключи: стек, схему БД, API, деплой.`,
  }

  const docs = await callAI([
    { role: "system", content: "Ты технический писатель. Пиши чётко, структурированно. Markdown." },
    { role: "user", content: prompts[docType] || prompts.readme },
  ], { maxTokens: 3000 })

  return NextResponse.json({ ok: true, docs, type: docType })
}

async function getProjectSettings(projectId: string) {
  const { data } = await supabaseAdmin
    .from("pai_project_settings")
    .select("*")
    .eq("project_id", projectId)
    .single()
  return NextResponse.json(data || { project_id: projectId, deploy_status: "pending" })
}

async function saveProjectSettings(projectId: string, data?: Record<string, unknown>) {
  if (!data) return NextResponse.json({ error: "No data" }, { status: 400 })

  const { data: existing } = await supabaseAdmin
    .from("pai_project_settings")
    .select("id")
    .eq("project_id", projectId)
    .single()

  const settings = { project_id: projectId, ...data, updated_at: new Date().toISOString() }

  if (existing) {
    await supabaseAdmin.from("pai_project_settings").update(settings).eq("project_id", projectId)
  } else {
    await supabaseAdmin.from("pai_project_settings").insert(settings)
  }

  return NextResponse.json({ ok: true })
}

async function deployProject(projectId: string) {
  const { data: project } = await supabaseAdmin.from("pai_projects").select("*").eq("id", projectId).single()
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: settings } = await supabaseAdmin
    .from("pai_project_settings")
    .select("*")
    .eq("project_id", projectId)
    .single()

  if (!settings) return NextResponse.json({ error: "No deploy settings" }, { status: 400 })

  await supabaseAdmin.from("pai_project_settings")
    .update({ deploy_status: "deploying", updated_at: new Date().toISOString() })
    .eq("project_id", projectId)

  await notify(`🚀 Деплой запущен: "${project.title}" (${settings.hosting_type})`)

  return NextResponse.json({ ok: true, hosting: settings.hosting_type, domain: settings.domain })
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
