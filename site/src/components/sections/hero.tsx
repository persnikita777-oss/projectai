import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <Badge variant="secondary" className="mb-6 text-sm">
          Цены в 5 раз ниже рынка
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          AI-разработка
          <br />
          <span className="text-primary">доступная каждому</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Боты, сайты, автоматизация с искусственным интеллектом — от 20 000 ₽.
          AI сам собирает ТЗ, пишет код, тестирует и деплоит.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/brief">
              Обсудить проект
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/estimate">Рассчитать стоимость</Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span>AI чат-бот — от 30K</span>
          <span>Сайт — от 20K</span>
          <span>AI-ассистент — от 70K</span>
          <span>Автоматизация — от 100K</span>
        </div>
      </div>
    </section>
  )
}
