# Исследование: Сайт AI-студии с интегрированным AI-ассистентом

Дата: 2026-03-30

## 1. Интеграция Claude API на сайт

### Два основных подхода:

**A. Vercel AI SDK 6 + Anthropic Provider (рекомендуется для веба)**
- npm: `ai` + `@ai-sdk/anthropic`
- Поддержка: streaming, tool calling, structured output (Zod), Agent abstraction
- Работает с Next.js, Nuxt, SvelteKit из коробки
- Модели: claude-sonnet-4-5, claude-opus-4-6
- Extended thinking, web search tool, context management
- Docs: https://ai-sdk.dev/providers/ai-sdk-providers/anthropic

**B. Claude Agent SDK (для сложной агентной логики)**
- Python: `pip install claude-agent-sdk`
- TypeScript: `npm install @anthropic-ai/agent-sdk`
- Встроенные инструменты: файлы, shell, web search, MCP
- Лучше подходит для backend-сервисов, не для фронтенда
- Docs: https://platform.claude.com/docs/en/agent-sdk/overview

### Выбор:
- Для чат-виджета на сайте → Vercel AI SDK
- Для бэкенд-обработки (генерация ТЗ, КП) → Claude Agent SDK или прямой API

## 2. Фреймворки для сайта

| Вариант | Плюсы | Минусы | Когда |
|---------|-------|--------|-------|
| **Next.js** | Full-stack, AI SDK нативно, RSC, SSR/SSG | Сложность, overhead | Основной продукт с AI-функциями |
| **Astro** | SEO-first, 90% меньше JS, islands | Ограничен для SPA/dashboard | Маркетинговый сайт + отдельный AI-бэкенд |
| **Nuxt** | Vue-экосистема, Nitro, hybrid rendering | Меньше AI-экосистема | Если команда на Vue |

**Рекомендация:** Next.js (App Router) + Vercel AI SDK — наиболее зрелая экосистема для AI-сайта.
Альтернатива: Astro для лендинга + Next.js API routes для AI-бэкенда.

## 3. Похожие проекты и SaaS

### SaaS (коммерческие):
- **Qwilr** — интерактивные предложения, eSignature, auto-pricing
- **Inventive AI** — автоматизация RFP lifecycle
- **Sembly AI** — proposal из транскрипта встреч
- **Bookipi** — AI генерация полного proposal из промпта
- **Better Proposals** — шаблоны + визуальный редактор

### Open-source:
- **ai-crm-agents** (GitHub) — 6 автономных агентов для CRM (lead qualification, pipeline, analytics)
- **Corely** (GitHub) — AI enterprise CRM/CMS на Next.js
- **Twenty CRM** — современная альтернатива Salesforce, open-source
- **Krayin CRM** — Laravel + AI модуль для sales content
- **NocoBase** — no-code/low-code с AI Employees

### Workflow engines:
- **n8n** — open-source, визуальные AI-воркфлоу, интеграция с CRM
- **Conductor (Netflix)** — оркестрация микросервисов

## 4. Архитектура

```
[Фронтенд - Next.js]
  ├── Лендинг/портфолио (SSG)
  ├── AI-чат виджет (Vercel AI SDK + streaming)
  └── Личный кабинет клиента (SSR)

[Бэкенд - Next.js API Routes / отдельный сервис]
  ├── Chat API (Vercel AI SDK + Claude)
  ├── Tool Calling (сбор данных через structured output)
  ├── Document Generation (ТЗ, КП → PDF)
  └── Webhooks (уведомления, CRM sync)

[AI Layer]
  ├── Claude API (Sonnet 4.5/4.6) — диалог, сбор ТЗ
  ├── Tool calling — извлечение структурированных данных
  ├── Structured output (Zod) — валидация ТЗ
  └── Extended thinking — оценка сложности

[Данные]
  ├── PostgreSQL / Supabase — пользователи, заявки, проекты
  ├── Redis — сессии чата, кеш
  └── S3/Vercel Blob — файлы, сгенерированные КП

[Интеграции]
  ├── CRM: HubSpot / Bitrix24 API
  ├── n8n — автоматизация pipeline
  ├── Email: Resend / SendGrid
  ├── Telegram Bot (уведомления)
  └── Календарь: Cal.com / Calendly
```

## 5. Pipeline: заявка → КП → CRM

### Этапы:

1. **Заявка** — клиент открывает чат-виджет или форму на сайте
2. **AI-диалог** — Claude через tool calling собирает:
   - Тип проекта (сайт, приложение, бот, интеграция)
   - Функциональные требования
   - Дизайн-предпочтения
   - Бюджет и сроки
   - Контактные данные
3. **Генерация ТЗ** — structured output → JSON → markdown/PDF
4. **Оценка** — Claude анализирует ТЗ, подбирает стек, считает часы
5. **КП** — генерация коммерческого предложения (PDF/веб-страница)
6. **CRM** — автоматическая отправка в CRM (HubSpot/Bitrix24)
7. **Уведомление** — менеджеру в Telegram + email клиенту

### Автоматизация через n8n:
- Webhook от сайта → n8n
- n8n вызывает Claude API для генерации ТЗ/КП
- n8n создает deal в CRM
- n8n отправляет email + Telegram notification

## 6. Prompt engineering для сбора ТЗ

### System prompt для AI-ассистента (пример):

```
Ты — AI-консультант студии [Название]. Твоя задача — собрать техническое задание у клиента через дружелюбный диалог.

ПРАВИЛА:
1. Задавай по 1-2 вопроса за раз, не перегружай клиента
2. Используй flipped interaction — ТЫ спрашиваешь, клиент отвечает
3. Если клиент не знает ответ — предложи варианты на выбор
4. Фиксируй каждый ответ через tool call save_requirement
5. Когда все ключевые поля заполнены — подытожь и предложи сформировать КП

ОБЯЗАТЕЛЬНЫЕ ПОЛЯ:
- project_type: [website, mobile_app, bot, integration, other]
- description: краткое описание проекта
- features: список функций (минимум 3)
- design: [template, custom, redesign, no_preference]
- target_audience: кто будет пользоваться
- budget_range: [50k-150k, 150k-500k, 500k-1M, 1M+, not_sure]
- timeline: [1month, 2-3months, 3-6months, flexible]
- contact_name: имя
- contact_email: email
- contact_phone: телефон (опционально)

СТИЛЬ:
- Дружелюбный, профессиональный, без канцелярита
- Если клиент описывает расплывчато — задай уточняющий вопрос
- Приводи примеры: "Например, как у Wildberries" или "Похоже на Telegram-бот поддержки"
- Не используй технический жаргон без объяснения
```

### Tool definitions для structured output:

```typescript
const tools = {
  save_requirement: {
    description: "Сохраняет собранное требование клиента",
    parameters: z.object({
      field: z.enum(["project_type", "description", "features", ...]),
      value: z.string(),
      confidence: z.number().min(0).max(1)
    })
  },
  generate_summary: {
    description: "Генерирует итоговое ТЗ когда все поля заполнены",
    parameters: z.object({
      requirements: z.record(z.string())
    })
  },
  estimate_cost: {
    description: "Оценивает стоимость проекта на основе требований",
    parameters: z.object({
      project_type: z.string(),
      features: z.array(z.string()),
      design: z.string(),
      timeline: z.string()
    })
  }
}
```

## Стек: итоговая рекомендация

| Слой | Технология |
|------|-----------|
| Фронтенд | Next.js 15 (App Router) + Tailwind + shadcn/ui |
| AI Chat | Vercel AI SDK 6 + @ai-sdk/anthropic |
| Backend | Next.js API Routes / Route Handlers |
| БД | Supabase (PostgreSQL + Auth + Storage) |
| Генерация PDF | @react-pdf/renderer или Puppeteer |
| CRM | HubSpot API (бесплатный CRM) или Bitrix24 |
| Автоматизация | n8n (self-hosted) |
| Email | Resend |
| Деплой | Vercel (фронт) + Railway (n8n, фоновые задачи) |
| Мониторинг | Sentry + Vercel Analytics |
