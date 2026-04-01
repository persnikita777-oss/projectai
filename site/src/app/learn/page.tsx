import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  Code,
  Zap,
  Users,
  Check,
  ArrowRight,
  MessageSquare,
  Bot,
  Globe,
  Database,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Обучение — Делай AI-проекты сам",
  description:
    "Научим создавать AI-решения с Claude Code — чат-ботов, сайты, автоматизации. Курс + платформа + комьюнити.",
}

const modules = [
  {
    icon: Code,
    title: "Claude Code с нуля",
    description: "Установка, настройка, первый проект за 30 минут. Команды, промпты, best practices.",
    lessons: 5,
  },
  {
    icon: Bot,
    title: "AI чат-бот для бизнеса",
    description: "Создаём Telegram-бота с GPT: база знаний, RAG, интеграция с CRM.",
    lessons: 7,
  },
  {
    icon: Globe,
    title: "Сайт с AI за день",
    description: "Next.js + AI: от идеи до деплоя. Формы, аналитика, чат-виджет.",
    lessons: 6,
  },
  {
    icon: Database,
    title: "Автоматизация процессов",
    description: "Подключаем AI к 1С, Google Sheets, CRM. Отчёты, уведомления, документы.",
    lessons: 5,
  },
  {
    icon: Zap,
    title: "Продвинутые техники",
    description: "Мульти-агенты, Function Calling, сложные пайплайны, оптимизация стоимости.",
    lessons: 4,
  },
  {
    icon: Users,
    title: "Монетизация навыков",
    description: "Как продавать AI-услуги: ценообразование, поиск клиентов, упаковка кейсов.",
    lessons: 3,
  },
]

const plans = [
  {
    name: "Базовый",
    price: "5 900 ₽",
    period: "разово",
    features: [
      "Все 30 видео-уроков",
      "Доступ к материалам навсегда",
      "Шаблоны промптов",
      "Чек-листы по каждому модулю",
    ],
    cta: "Начать обучение",
    popular: false,
  },
  {
    name: "Продвинутый",
    price: "9 900 ₽",
    period: "разово",
    features: [
      "Всё из Базового",
      "Доступ в закрытое комьюнити",
      "Разбор ваших проектов",
      "Шаблоны готовых проектов",
      "Обновления курса 12 месяцев",
    ],
    cta: "Выбрать Продвинутый",
    popular: true,
  },
  {
    name: "Подписка",
    price: "2 900 ₽",
    period: "/ мес",
    features: [
      "Всё из Продвинутого",
      "Ежемесячные live-разборы",
      "Приоритетная поддержка",
      "Новые модули каждый месяц",
      "Отмена в любой момент",
    ],
    cta: "Подписаться",
    popular: false,
  },
]

const results = [
  { value: "30+", label: "видео-уроков" },
  { value: "6", label: "практических модулей" },
  { value: "5", label: "готовых проектов" },
  { value: "24/7", label: "доступ к материалам" },
]

export default function LearnPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <GraduationCap className="h-3.5 w-3.5 mr-1" />
            Обучение
          </Badge>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            Делай AI-проекты сам
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Научим создавать чат-ботов, сайты и автоматизации с помощью Claude Code.
            Дешевле и быстрее, чем заказывать у студии.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" asChild>
              <a href="https://t.me/projectai_bot" target="_blank" rel="noopener noreferrer">
                Записаться
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#program">Программа курса</a>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {results.map((r) => (
            <Card key={r.label}>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{r.value}</p>
                <p className="text-sm text-muted-foreground">{r.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* For whom */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Для кого этот курс</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Предприниматели</h3>
                <p className="text-sm text-muted-foreground">
                  Хотите внедрить AI, но не хотите платить 100K+ студиям. Научитесь делать
                  базовые решения сами — чат-боты, автоматизации, сайты.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Фрилансеры</h3>
                <p className="text-sm text-muted-foreground">
                  Добавьте AI-услуги в портфолио. Один AI-проект приносит 20-100K — а делается
                  за 3-7 дней с правильными инструментами.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Начинающие разработчики</h3>
                <p className="text-sm text-muted-foreground">
                  Не нужен опыт программирования. Claude Code пишет код за вас — нужно лишь
                  понимать, что строить и как формулировать задачи.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="mb-16" />

        {/* Program */}
        <div id="program" className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Программа курса</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => {
              const Icon = m.icon
              return (
                <Card key={m.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          Модуль {i + 1}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-bold mb-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{m.description}</p>
                    <p className="text-xs text-muted-foreground">{m.lessons} уроков</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Separator className="mb-16" />

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-2">Тарифы</h2>
          <p className="text-center text-muted-foreground mb-8">
            Выберите подходящий формат обучения
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg" : ""}>
                <CardContent className="pt-6">
                  {plan.popular && (
                    <Badge className="mb-3">Популярный</Badge>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <a href="https://t.me/projectai_bot" target="_blank" rel="noopener noreferrer">
                      {plan.cta}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ-like section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Остались вопросы?</h3>
                <p className="text-muted-foreground text-sm">
                  Напишите в Telegram — ответим за 5 минут и поможем выбрать формат обучения
                </p>
              </div>
              <Button variant="outline" asChild className="shrink-0">
                <a href="https://t.me/projectai_bot" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Написать в Telegram
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
