import type { Metadata } from "next"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Портфолио",
  description: "Кейсы ProjectAI — чат-боты, AI-ассистенты, автоматизация и интеграции для бизнеса.",
}

const cases = [
  {
    slug: "chatbot-realestate",
    title: "AI-консультант для агентства недвижимости",
    category: "Чат-бот",
    image: "/portfolio/chatbot.jpg",
    description:
      "Чат-бот для сайта и Telegram, который отвечает на вопросы клиентов, подбирает объекты по параметрам и записывает на просмотр.",
    results: [
      { label: "Конверсия в заявку", value: "+42%" },
      { label: "Нагрузка на менеджеров", value: "−60%" },
      { label: "Время ответа", value: "< 5 сек" },
    ],
    tags: ["Telegram", "Сайт", "GPT-4", "RAG"],
    timeline: "5 дней",
  },
  {
    slug: "ecommerce-assistant",
    title: "AI-ассистент для интернет-магазина",
    category: "AI-ассистент",
    image: "/portfolio/ecommerce.jpg",
    description:
      "Умный помощник для e-commerce: подбирает товары по запросу, сравнивает характеристики, помогает с оформлением заказа и отслеживанием доставки.",
    results: [
      { label: "Средний чек", value: "+28%" },
      { label: "Возвраты", value: "−35%" },
      { label: "Обращения в поддержку", value: "−50%" },
    ],
    tags: ["Сайт-виджет", "API", "Каталог"],
    timeline: "7 дней",
  },
  {
    slug: "medical-automation",
    title: "Автоматизация записи в клинике",
    category: "Автоматизация",
    image: "/portfolio/medicine.jpg",
    description:
      "Система автоматической записи пациентов через Telegram-бота: выбор врача и времени, напоминания, интеграция с МИС клиники.",
    results: [
      { label: "Записи через бота", value: "73%" },
      { label: "Неявки", value: "−40%" },
      { label: "Время администратора", value: "−4 ч/день" },
    ],
    tags: ["Telegram", "МИС", "Напоминания", "Календарь"],
    timeline: "10 дней",
  },
  {
    slug: "logistics-dashboard",
    title: "AI-аналитика для логистической компании",
    category: "Интеграция AI",
    image: "/portfolio/logistics.jpg",
    description:
      "Дашборд с AI-анализом маршрутов, прогнозом загрузки и автоматическими отчётами. Данные из 1С, GPS-трекеров и CRM.",
    results: [
      { label: "Затраты на топливо", value: "−18%" },
      { label: "Точность прогноза", value: "94%" },
      { label: "Время на отчёты", value: "−80%" },
    ],
    tags: ["1С", "Дашборд", "ML", "API"],
    timeline: "14 дней",
  },
  {
    slug: "education-platform",
    title: "AI-тьютор для онлайн-школы",
    category: "Сайт + AI",
    image: "/portfolio/education.jpg",
    description:
      "Персональный AI-тьютор, который адаптирует программу под ученика, проверяет домашние задания и объясняет сложные темы простым языком.",
    results: [
      { label: "Завершение курса", value: "+55%" },
      { label: "Оценки учеников", value: "+32%" },
      { label: "Нагрузка на преподавателей", value: "−45%" },
    ],
    tags: ["Next.js", "GPT-4", "LMS", "Адаптация"],
    timeline: "12 дней",
  },
  {
    slug: "fintech-analytics",
    title: "AI-отчёты для финансового консалтинга",
    category: "AI-консалтинг",
    image: "/portfolio/fintech.jpg",
    description:
      "Автоматическая генерация финансовых отчётов и рекомендаций на основе данных из банков и бухгалтерских систем.",
    results: [
      { label: "Время подготовки отчёта", value: "−90%" },
      { label: "Клиентов на аналитика", value: "×3" },
      { label: "Точность рекомендаций", value: "97%" },
    ],
    tags: ["Банк API", "1С", "PDF-генерация", "GPT-4"],
    timeline: "10 дней",
  },
]

export default function PortfolioPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Портфолио</Badge>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            Наши кейсы
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Реальные результаты для бизнеса — от чат-ботов до полной AI-автоматизации
          </p>
        </div>

        {/* Cases grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {cases.map((c) => (
            <Card key={c.slug} className="overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                    {c.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-foreground">
                    {c.timeline}
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-5">
                <h2 className="text-lg font-bold mb-2">{c.title}</h2>
                <p className="text-sm text-muted-foreground mb-4">{c.description}</p>

                {/* Results */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {c.results.map((r) => (
                    <div key={r.label} className="text-center p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-sm font-bold text-primary">{r.value}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">{r.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="inline-block">
            <CardContent className="pt-6 px-8 pb-6">
              <h2 className="text-xl font-bold mb-2">Хотите так же?</h2>
              <p className="text-muted-foreground mb-4">
                Расскажите о проекте — мы подготовим оценку за 30 минут
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/brief">
                    Оставить заявку
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/estimate">Калькулятор</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
