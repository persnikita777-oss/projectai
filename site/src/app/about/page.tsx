import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Zap, Shield, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "О компании",
  description: "ProjectAI — AI-студия полного цикла. Делаем AI-разработку доступной для бизнеса любого размера.",
}

const values = [
  {
    icon: Zap,
    title: "Скорость",
    description: "MVP за 3-7 дней вместо месяцев. AI пишет код, мы контролируем качество.",
  },
  {
    icon: Shield,
    title: "Прозрачность",
    description: "Цены на сайте. Никаких скрытых платежей. Вы знаете стоимость до начала работы.",
  },
  {
    icon: Brain,
    title: "Мультимодельность",
    description: "Используем лучшие модели под каждую задачу: Claude, YandexGPT, GigaChat, open-source.",
  },
  {
    icon: Users,
    title: "Доступность",
    description: "Цены в 5 раз ниже рынка. AI-разработка для бизнеса любого размера — от ИП до среднего бизнеса.",
  },
]

const stats = [
  { value: "×5", label: "дешевле рынка" },
  { value: "3-7", label: "дней на MVP" },
  { value: "6", label: "типов AI-решений" },
  { value: "24/7", label: "работа AI-агентов" },
]

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">О нас</Badge>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            AI-разработка, доступная каждому
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ProjectAI — студия полного цикла для малого и среднего бизнеса в России.
            Мы используем AI чтобы делать разработку быстрее и дешевле,
            не жертвуя качеством.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Separator className="my-16" />

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Миссия</h2>
          <p className="text-muted-foreground">
            Сделать AI-разработку доступной для бизнеса любого размера.
            Сегодня AI-студии берут 150K-3M за проект, а сроки — от месяца.
            Мы сокращаем и то, и другое в 5-10 раз.
          </p>
          <p className="text-muted-foreground mt-4">
            Наша стратегия — массовость. Низкие цены, быстрая разработка,
            простая коммуникация. Не десяток дорогих проектов, а сотни доступных.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Наши принципы</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{value.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <Separator className="my-16" />

        {/* How we work */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Как это работает</h2>
          <p className="text-muted-foreground mb-6">
            AI-инструменты (Claude Code, Cursor, YandexGPT) пишут 80% кода.
            Инженер контролирует архитектуру, качество и безопасность.
            Результат: скорость AI + надёжность человека.
          </p>
          <p className="text-muted-foreground">
            Мы не заменяем разработчиков — мы делаем каждого разработчика в 10 раз продуктивнее.
            Это позволяет делать проекты быстрее и дешевле без потери качества.
          </p>
        </section>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Есть проект?</h2>
            <p className="mb-6 opacity-90">
              Расскажите о задаче — оценим стоимость и сроки за 5 минут
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/brief">
                Обсудить проект <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
