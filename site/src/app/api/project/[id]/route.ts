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
  const body = await req.json()
  const { action } = body

  const { data: project } = await supabaseAdmin
    .from("pai_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  switch (action) {
    case "save-tz-answers":
      return saveTZAnswers(project, body.answers)
    case "generate-tz":
      return generateTZ(project)
    case "save-tz":
      return saveTZ(project, body.tz)
    case "generate-proposal":
      return generateProposal(project)
    case "approve-proposal":
      return approveProposal(project)
    case "sign-contract":
      return signContract(project)
    case "confirm-payment":
      return confirmPayment(project)
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}

// --- Save TZ Answers (questionnaire) ---
async function saveTZAnswers(project: Record<string, unknown>, answers: Record<string, unknown>) {
  if (!answers) {
    return NextResponse.json({ error: "Нет ответов" }, { status: 400 })
  }

  await supabaseAdmin
    .from("pai_projects")
    .update({ tz_answers: answers, updated_at: new Date().toISOString() })
    .eq("id", project.id)

  return NextResponse.json({ ok: true })
}

// --- Generate TZ ---
async function generateTZ(project: Record<string, unknown>) {
  const serviceLabel = SERVICE_LABELS[project.service_type as string] || project.service_type
  const answers = project.tz_answers as Record<string, unknown> | null

  // Build rich context from questionnaire answers
  const styleLabels: Record<string, string> = {
    minimal: "Минимализм", corporate: "Корпоративный",
    creative: "Креативный", tech: "Технологичный",
  }
  const paletteLabels: Record<string, string> = {
    blue: "Синий / Деловой", green: "Зелёный / Эко",
    purple: "Фиолетовый / Креатив", red: "Красный / Энергия",
    dark: "Тёмный / Премиум", warm: "Тёплый / Уютный", custom: "Свои цвета",
  }

  let questionnaireBlock = ""
  if (answers) {
    const parts: string[] = []
    if (answers.style) parts.push(`- Стиль дизайна: ${styleLabels[answers.style as string] || answers.style}`)
    if (answers.styleComment) parts.push(`- Комментарий к стилю: ${answers.styleComment}`)
    if (answers.palette) {
      let paletteText = paletteLabels[answers.palette as string] || answers.palette as string
      if (answers.palette === "custom" && answers.customColors) paletteText += ` (${answers.customColors})`
      parts.push(`- Цветовая схема: ${paletteText}`)
    }
    if (answers.logoUrl) parts.push(`- Логотип: ${answers.logoUrl}`)
    if (answers.blocks) parts.push(`- Выбранные блоки: ${(answers.blocks as string[]).join(", ")}`)
    if (answers.customBlocks) parts.push(`- Дополнительные блоки: ${answers.customBlocks}`)
    if (answers.businessDesc) parts.push(`- О бизнесе: ${answers.businessDesc}`)
    if (answers.targetAudience) parts.push(`- Целевая аудитория: ${answers.targetAudience}`)
    if (answers.competitors) parts.push(`- Конкуренты: ${answers.competitors}`)
    if (answers.references) parts.push(`- Референсы: ${answers.references}`)
    if (answers.wishes) parts.push(`- Пожелания: ${answers.wishes}`)
    if (parts.length > 0) questionnaireBlock = `\nОтветы клиента на опросник:\n${parts.join("\n")}\n`
  }

  const prompt = `Ты — технический аналитик AI-студии ProjectAI. На основе брифа и ответов клиента составь детальное техническое задание.

Бриф:
- Услуга: ${serviceLabel}
- Платформа: ${project.platform || "не указана"}
- Интеграции: ${(project.integrations as string[])?.join(", ") || "нет"}
- Доп. услуги: ${(project.extras as string[])?.join(", ") || "нет"}
- Описание: ${project.description || "не указано"}
- Бюджет: ${project.budget_range || "не указан"}
- Сроки: ${project.timeline || "не указаны"}
${questionnaireBlock}
Составь ТЗ в формате:

## 1. Цель проекта
[Конкретная бизнес-цель на основе описания бизнеса и ЦА]

## 2. Дизайн и стиль
[Стиль, цветовая схема, общий визуальный подход на основе ответов клиента]

## 3. Структура и блоки
[Перечисление блоков/страниц с описанием содержимого каждого]

## 4. Функциональные требования
[Пронумерованный список функций]

## 5. Технический стек
[Список технологий]

## 6. Интеграции
[Описание каждой интеграции]

## 7. Нефункциональные требования
[Производительность, безопасность, масштабируемость]

## 8. Этапы и сроки
[Разбивка по этапам с оценкой дней]

## 9. Критерии приёмки
[Чёткие условия завершения]

Пиши конкретно, без воды. Используй ответы клиента для персонализации — если клиент указал стиль, цвета, блоки, референсы — включи их в ТЗ.`

  const tz = await callAI([
    { role: "system", content: "Ты технический аналитик. Пиши ТЗ кратко, конкретно, структурированно. На русском. Опирайся на ответы клиента для персонализации." },
    { role: "user", content: prompt },
  ], { maxTokens: 3000 })

  await supabaseAdmin
    .from("pai_projects")
    .update({ tz_text: tz, status: "tz", updated_at: new Date().toISOString() })
    .eq("id", project.id)

  await notify(`📋 ТЗ сформировано для проекта "${project.title}"\n\nID: ${project.id}`)

  return NextResponse.json({ ok: true, tz })
}

// --- Save TZ (client edits) ---
async function saveTZ(project: Record<string, unknown>, tz: string) {
  if (!tz || typeof tz !== "string") {
    return NextResponse.json({ error: "ТЗ не может быть пустым" }, { status: 400 })
  }

  await supabaseAdmin
    .from("pai_projects")
    .update({ tz_text: tz, updated_at: new Date().toISOString() })
    .eq("id", project.id)

  return NextResponse.json({ ok: true })
}

// --- Generate Proposal ---
async function generateProposal(project: Record<string, unknown>) {
  if (!project.tz_text) {
    return NextResponse.json({ error: "Сначала нужно сформировать ТЗ" }, { status: 400 })
  }

  const basePrice = BASE_PRICES[project.service_type as string] || 50000
  const estimateAmount = (project.estimate_amount as number) || basePrice

  const prompt = `Ты — коммерческий директор AI-студии ProjectAI. На основе ТЗ составь коммерческое предложение и план разработки.

ТЗ:
${project.tz_text}

Оценка калькулятора: от ${estimateAmount.toLocaleString("ru-RU")} ₽
Базовая цена услуги: от ${basePrice.toLocaleString("ru-RU")} ₽

О студии ProjectAI:
- Разработка ведётся AI-агентом (Claude Code) под контролем инженера
- Реальные скорости: полный сайт (10+ страниц, SEO, аналитика) = 4-6 часов
- Личный кабинет с авторизацией + API = 2-3 часа
- AI чат-бот (интеграция, обучение) = 2-4 часа
- Полная платформа (сайт + ЛК + бот + API + деплой) = 1-2 дня
- Наши цены в 3-5 раз ниже рынка за счёт AI-автоматизации

Правила сроков:
- AI чат-бот: 1-3 дня
- Сайт + AI: 1-2 дня
- AI-ассистент (RAG): 3-5 дней
- Автоматизация процессов: 5-10 дней
- Интеграция AI: 3-7 дней
- AI-консалтинг: 1-2 дня

Составь КП и план:

## Коммерческое предложение

### Что входит
[Список из 5-8 пунктов что получит клиент]

### Стоимость
[Итоговая цена в рублях — конкретная сумма, не диапазон]
[Разбивка: что включено в цену]

### План разработки
[Пронумерованные этапы с конкретными сроками в часах/днях]
[Каждый этап: название — что делаем — срок]

### Общий срок
[Итого: X рабочих дней]

### Этапы оплаты
[50% предоплата, 50% после сдачи]

### Гарантии
[1 месяц бесплатной поддержки, до 3 итераций правок, исходный код]

Цена должна быть реалистичной, основанной на оценке калькулятора. Сроки — реальные, основанные на наших скоростях. Пиши от лица студии.`

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

// --- Approve proposal → contract ---
async function approveProposal(project: Record<string, unknown>) {
  await supabaseAdmin
    .from("pai_projects")
    .update({ status: "contract", updated_at: new Date().toISOString() })
    .eq("id", project.id)

  await notify(`📝 КП утверждено для проекта "${project.title}"\nСтатус: Подготовка договора`)

  return NextResponse.json({ ok: true })
}

// --- Sign contract → payment ---
async function signContract(project: Record<string, unknown>) {
  await supabaseAdmin
    .from("pai_projects")
    .update({ status: "payment", updated_at: new Date().toISOString() })
    .eq("id", project.id)

  await notify(`✍️ Договор подписан для проекта "${project.title}"\nСтатус: Ожидание предоплаты 50%`)

  return NextResponse.json({ ok: true })
}

// --- Confirm payment → create tasks & start development ---
async function confirmPayment(project: Record<string, unknown>) {
  if (!project.tz_text) {
    return NextResponse.json({ error: "Нет ТЗ" }, { status: 400 })
  }

  // Notify admin about payment claim — admin verifies manually
  await notify(`💰 Клиент сообщил об оплате!\nПроект: "${project.title}"\n\n⚠️ Проверьте поступление средств и подтвердите.`)

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

  const taskInserts = tasks.map((t, i) => ({
    project_id: project.id,
    title: t.title,
    description: t.description,
    sort_order: i,
    status: "pending",
  }))

  await supabaseAdmin.from("pai_tasks").insert(taskInserts)

  await supabaseAdmin
    .from("pai_projects")
    .update({
      status: "development",
      dev_plan: tasks.map((t, i) => `${i + 1}. ${t.title}`).join("\n"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", project.id)

  await notify(`✅ Проект "${project.title}" запущен в разработку!\nСоздано ${tasks.length} задач.`)

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
