import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-primary p-10 md:p-16 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold">
            Опишите проект — получите оценку за 5 минут
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            AI-ассистент соберёт требования, предложит решение и рассчитает стоимость.
            Без звонков и ожидания.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/brief">
                Обсудить проект
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/estimate">Калькулятор стоимости</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
