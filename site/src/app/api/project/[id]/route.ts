import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { callAI, BASE_PRICES, SERVICE_LABELS } from "@/lib/ai"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const ADMIN_CHAT = process.env.ADMIN_ID

// GET — project data (for client-side fetching)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: project, error } = await supabaseAdmin
    .from("pai_projects")
    .select("*, pai_tasks(*)")
    .eq("id", id)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json(project)
}

// POST — project actions: generate-tz, generate-proposal, approve, create-tasks
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { action } = await req.json()

  const { data: project } = await supabaseAdmin
    .from("pai_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  switch (action) {
    case "generate-tz":
      return generateTZ(project)
    case "generate-proposal":
      return generateProposal(project)
    case "approve":
      return approveProject(project)
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}

// --- Generate TZ ---
async function generateTZ(project: Record<string, unknown>) {
  const serviceLabel = SERVICE_LABELS[project.service_type as string] || project.service_type
  const prompt = `Ты — технический аналитик AI-студии ProjectAI. На основе брифа клиента составь детальное техническое задание.

Бриф:
- Услуга: ${serviceLabel}
- Платформа: ${project.platform || "не указана"}
- Интеграции: ${(project.integrations as string[])?.join(", ") || "нет"}
- Доп. услуги: ${(project.extras as string[])?.join(", ") || "нет"}
- Описание: ${project.description || "не указано"}
- Бюджет: ${project.budget_range || "не указан"}
- Сроки: ${project.timeline || "не указаны"}

Составь ТЗ в формате:

## 1. Цель проекта
[Конкретная бизнес-цель]

## 2. Функциональные требования
[Пронумерованный список функций]

## 3. Технический стек
[Список технологий]

## 4. Интеграции
[Описание каждой интеграции]

## 5. Нефункциональные требования
[Производительность, безопасность, масштабируемость]

## 6. Этапы и сроки
[Разбивка по этапам с оценкой дней]

## 7. Критерии приёмки
[Чёткие условия завершения]

Пиши конкретно, без воды. Ориентируйся на реальные возможности.`

  const tz = await callAI([
    { role: "system", content: "Ты технический аналитик. Пиши ТЗ кратко, конкретно, структурированно. На русском." },
    { role: "user", content: prompt },
  ], { maxTokens: 3000 })

  await supabaseAdmin
    .from("pai_projects")
    .update({ tz_text: tz, status: "tz", updated_at: new Date().toISOString() })
    .eq("id", project.id)

  await notify(`📋 ТЗ сформировано для проекта "${project.title}"\n\nID: ${project.id}`)

  return NextResponse.json({ ok: true, tz })
}

// --- Generate Proposal ---
async function generateProposal(project: Record<string, unknown>) {
  if (!project.tz_text) {
    return NextResponse.json({ error: "Сначала нужно сформировать ТЗ" }, { status: 400 })
  }

  const basePrice = BASE_PRICES[project.service_type as string] || 50000
  const estimateAmount = (project.estimate_amount as number) || basePrice

  const prompt = `Ты — коммерческий директор AI-студии ProjectAI. На основе ТЗ составь коммерческое предложение.

ТЗ:
${project.tz_text}

Оценка калькулятора: от ${estimateAmount.toLocaleString("ru-RU")} ₽
Базовая цена услуги: от ${basePrice.toLocaleString("ru-RU")} ₽

Правила ценообразования ProjectAI:
- Наши цены в 3-5 раз ниже рынка (маржа 60-90% за счёт AI-автоматизации)
- Простой проект (бот): markup ×6-15 от себестоимости
- Средний (ассистент): ×5-10
- Сложный (сервис): ×4-8
- Себестоимость: API ~3500₽ + инфра ~1000₽ + ops ~8000₽ = ~12500₽

Составь КП:

## Коммерческое предложение

### Что входит
[Список из 5-8 пунктов что получит клиент]

### Стоимость
[Итоговая цена в рублях — конкретная сумма, не диапазон]
[Разбивка: что включено в цену]

### Сроки
[Конкретные сроки в рабочих днях]

### Этапы оплаты
[Обычно: 50% предоплата, 50% после сдачи]

### Гарантии
[1 месяц бесплатной поддержки, 3 итерации правок]

Цена должна быть реалистичной, на основе оценки калькулятора. Пиши от лица студии.`

  const proposal = await callAI([
    { role: "system", content: "Ты коммерческий директор AI-студии. Пиши КП кратко, убедительно, с конкретными цифрами. На русском." },
    { role: "user", content: prompt },
  ], { maxTokens: 2000 })

  // Extract price from proposal (rough)
  const priceMatch = proposal.match(/(\d[\d\s]*\d)\s*₽/)
  const proposalPrice = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ""), 10) : estimateAmount

  await supabaseAdmin
    .from("pai_projects")
    .update({
      proposal_text: proposal,
      proposal_price: proposalPrice,
      status: "proposal",
      updated_at: new Date().toISOString(),
    })
    .eq("id", project.id)

  await notify(`💰 КП отправлено клиенту\nПроект: "${project.title}"\nСумма: ${proposalPrice.toLocaleString("ru-RU")} ₽`)

  return NextResponse.json({ ok: true, proposal, price: proposalPrice })
}

// --- Approve & create tasks ---
async function approveProject(project: Record<string, unknown>) {
  if (!project.tz_text) {
    return NextResponse.json({ error: "Нет ТЗ" }, { status: 400 })
  }

  const prompt = `На основе ТЗ проекта разбей работу на конкретные задачи для разработчика.

ТЗ:
${project.tz_text}

Верни JSON-массив задач. Каждая задача:
{
  "title": "Краткое название (макс 80 символов)",
  "description": "Что конкретно нужно сделать (2-3 предложения)"
}

Порядок задач = порядок выполнения. Обычно 5-12 задач.
Верни ТОЛЬКО JSON, без markdown, без пояснений.`

  const tasksRaw = await callAI([
    { role: "system", content: "Верни только валидный JSON-массив. Без markdown, без ```." },
    { role: "user", content: prompt },
  ], { maxTokens: 2000, temperature: 0.3 })

  let tasks: { title: string; description: string }[]
  try {
    const cleaned = tasksRaw.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    tasks = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: "Ошибка парсинга задач", raw: tasksRaw }, { status: 500 })
  }

  // Insert tasks
  const taskInserts = tasks.map((t, i) => ({
    project_id: project.id,
    title: t.title,
    description: t.description,
    sort_order: i,
    status: "pending",
  }))

  await supabaseAdmin.from("pai_tasks").insert(taskInserts)

  // Update project status
  await supabaseAdmin
    .from("pai_projects")
    .update({
      status: "development",
      dev_plan: tasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", project.id)

  await notify(`✅ Проект "${project.title}" утверждён!\nСоздано ${tasks.length} задач.\nСтатус: В разработке`)

  return NextResponse.json({ ok: true, tasks: taskInserts })
}

// --- Telegram notification ---
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
