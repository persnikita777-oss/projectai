import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { services } from "@/data/services"
import { serviceDetails } from "@/data/service-details"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export async function generateStaticParams() {
  return services.map((s) => ({ id: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const service = services.find((s) => s.id === id)
  if (!service) return {}
  return {
    title: service.title,
    description: service.description,
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const service = services.find((s) => s.id === id)
  if (!service) notFound()

  const details = serviceDetails[id]
  const Icon = service.icon

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back link */}
        <Link
          href="/#services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Все услуги
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{service.title}</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mt-4">
            {details?.longDescription || service.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Badge variant="secondary" className="text-base px-4 py-1">
              {service.price}
            </Badge>
            <span className="text-sm text-muted-foreground line-through">
              {service.marketPrice}
            </span>
            <Badge variant="secondary" className="text-base px-4 py-1">
              {service.timeline}
            </Badge>
          </div>
          <div className="flex gap-3 mt-8">
            <Button size="lg" asChild>
              <Link href="/brief">Обсудить проект</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/estimate">Рассчитать стоимость</Link>
            </Button>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Что входит</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        {details && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Преимущества</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {details.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-12" />

            {/* Process */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Как мы работаем</h2>
              <div className="grid gap-4">
                {details.process.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step.step}</p>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="my-12" />

            {/* FAQ */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Частые вопросы</h2>
              <div className="grid gap-4">
                {details.faq.map((item, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <p className="font-semibold mb-2">{item.question}</p>
                      <p className="text-muted-foreground text-sm">{item.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Готовы начать?</h2>
            <p className="mb-6 opacity-90">
              Опишите задачу — мы оценим стоимость и сроки за 5 минут
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
