import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Блог",
  description: "Статьи ProjectAI об AI в бизнесе — практические гайды, кейсы и тренды.",
}

const posts = [
  {
    slug: "ai-for-small-business",
    title: "AI для малого бизнеса: с чего начать в 2026 году",
    excerpt:
      "Разбираем 5 задач, которые малый бизнес может автоматизировать с помощью AI уже сегодня — без программистов и миллионных бюджетов.",
    image: "/blog/ai-business.jpg",
    category: "Гайд",
    readTime: "7 мин",
    date: "28 марта 2026",
  },
  {
    slug: "how-to-create-chatbot",
    title: "Как создать чат-бота для бизнеса: пошаговое руководство",
    excerpt:
      "От выбора платформы до запуска — полный гайд по созданию AI чат-бота, который реально помогает клиентам и разгружает поддержку.",
    image: "/blog/chatbot-guide.jpg",
    category: "Гайд",
    readTime: "10 мин",
    date: "21 марта 2026",
  },
  {
    slug: "ai-roi-calculation",
    title: "Как посчитать ROI от внедрения AI: формула и примеры",
    excerpt:
      "Конкретные формулы и реальные цифры из наших кейсов. Сколько стоит AI-решение, через сколько окупается и где ловушки.",
    image: "/blog/ai-roi.jpg",
    category: "Аналитика",
    readTime: "8 мин",
    date: "14 марта 2026",
  },
  {
    slug: "no-code-ai-tools",
    title: "No-code AI инструменты: топ-7 для бизнеса",
    excerpt:
      "Обзор инструментов, которые позволяют внедрить AI без написания кода — от автоматизации документов до генерации контента.",
    image: "/blog/no-code-ai.jpg",
    category: "Обзор",
    readTime: "6 мин",
    date: "7 марта 2026",
  },
  {
    slug: "ai-trends-2026",
    title: "Тренды AI в 2026: что изменится для бизнеса",
    excerpt:
      "Мультимодальные модели, AI-агенты, персонализация — разбираем ключевые тренды и как их использовать уже сейчас.",
    image: "/blog/ai-trends.jpg",
    category: "Тренды",
    readTime: "9 мин",
    date: "28 февраля 2026",
  },
  {
    slug: "ai-implementation-mistakes",
    title: "5 ошибок при внедрении AI и как их избежать",
    excerpt:
      "Почему 60% AI-проектов проваливаются: завышенные ожидания, плохие данные, отсутствие метрик. Рассказываем как не попасть в эту статистику.",
    image: "/blog/ai-mistakes.jpg",
    category: "Опыт",
    readTime: "7 мин",
    date: "20 февраля 2026",
  },
]

export default function BlogPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Блог</Badge>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            Статьи и гайды
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Практические материалы об AI в бизнесе — без воды, с цифрами и примерами
          </p>
        </div>

        {/* Featured post */}
        <Link href={`/blog/${posts[0].slug}`} className="block mb-12 group">
          <Card className="overflow-hidden md:flex">
            <div className="relative h-56 md:h-auto md:w-1/2">
              <Image
                src={posts[0].image}
                alt={posts[0].title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <CardContent className="pt-6 md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge>{posts[0].category}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {posts[0].readTime}
                </span>
                <span className="text-xs text-muted-foreground">{posts[0].date}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                {posts[0].title}
              </h2>
              <p className="text-muted-foreground mb-4">{posts[0].excerpt}</p>
              <span className="flex items-center gap-1 text-sm font-medium text-primary">
                Читать
                <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Posts grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="overflow-hidden h-full">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
