import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export function LearnBanner() {
  return (
    <section className="py-12 border-t">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-xl border bg-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Хочешь делать такие проекты сам?</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Научим работать с Claude Code и создавать AI-решения.
                Дешевле и больше — своими руками.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/learn">Подробнее об обучении →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
