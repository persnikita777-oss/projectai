"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, ArrowRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface Option {
  id: string
  label: string
  price: number
}

const serviceTypes: Option[] = [
  { id: "chatbot", label: "AI чат-бот", price: 30000 },
  { id: "website", label: "Сайт + AI", price: 20000 },
  { id: "assistant", label: "AI-ассистент (RAG)", price: 70000 },
  { id: "automation", label: "Автоматизация процессов", price: 100000 },
  { id: "integration", label: "Интеграция AI в систему", price: 50000 },
  { id: "consulting", label: "AI-консалтинг", price: 10000 },
]

const platforms: Option[] = [
  { id: "telegram", label: "Telegram", price: 0 },
  { id: "website", label: "Сайт (виджет)", price: 5000 },
  { id: "vk", label: "VKontakte", price: 5000 },
  { id: "whatsapp", label: "WhatsApp", price: 10000 },
  { id: "multiple", label: "Несколько платформ", price: 15000 },
]

const integrations: Option[] = [
  { id: "none", label: "Без интеграций", price: 0 },
  { id: "crm", label: "CRM (amoCRM, Битрикс)", price: 15000 },
  { id: "1c", label: "1С", price: 20000 },
  { id: "analytics", label: "Аналитика (Яндекс.Метрика)", price: 5000 },
  { id: "payment", label: "Оплата (ЮKassa, Stripe)", price: 10000 },
]

const extras: Option[] = [
  { id: "training", label: "Обучение команды", price: 10000 },
  { id: "support1", label: "Поддержка 1 месяц", price: 15000 },
  { id: "support3", label: "Поддержка 3 месяца", price: 35000 },
  { id: "design", label: "Индивидуальный дизайн", price: 20000 },
]

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽"
}

export default function EstimatePage() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([])
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const toggleIntegration = (id: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const servicePrice = serviceTypes.find((s) => s.id === selectedService)?.price || 0
  const platformPrice = platforms.find((p) => p.id === selectedPlatform)?.price || 0
  const integrationsPrice = selectedIntegrations.reduce(
    (sum, id) => sum + (integrations.find((i) => i.id === id)?.price || 0),
    0
  )
  const extrasPrice = selectedExtras.reduce(
    (sum, id) => sum + (extras.find((e) => e.id === id)?.price || 0),
    0
  )
  const total = servicePrice + platformPrice + integrationsPrice + extrasPrice

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Calculator className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            Калькулятор стоимости
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Выберите параметры — получите предварительную оценку. Точную стоимость обсудим после брифа.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-8">
            {/* Service type */}
            <section>
              <h2 className="text-lg font-bold mb-3">1. Тип услуги</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {serviceTypes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                      selectedService === s.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedService === s.id && <Check className="h-4 w-4 text-primary" />}
                      {s.label}
                    </span>
                    <span className="text-muted-foreground">от {formatPrice(s.price)}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Platform */}
            <section>
              <h2 className="text-lg font-bold mb-3">2. Платформа</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                      selectedPlatform === p.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedPlatform === p.id && <Check className="h-4 w-4 text-primary" />}
                      {p.label}
                    </span>
                    <span className="text-muted-foreground">
                      {p.price === 0 ? "включено" : `+${formatPrice(p.price)}`}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Integrations */}
            <section>
              <h2 className="text-lg font-bold mb-3">3. Интеграции</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {integrations.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => toggleIntegration(i.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                      selectedIntegrations.includes(i.id) ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedIntegrations.includes(i.id) && <Check className="h-4 w-4 text-primary" />}
                      {i.label}
                    </span>
                    <span className="text-muted-foreground">
                      {i.price === 0 ? "—" : `+${formatPrice(i.price)}`}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Extras */}
            <section>
              <h2 className="text-lg font-bold mb-3">4. Дополнительно</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {extras.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => toggleExtra(e.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                      selectedExtras.includes(e.id) ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedExtras.includes(e.id) && <Check className="h-4 w-4 text-primary" />}
                      {e.label}
                    </span>
                    <span className="text-muted-foreground">+{formatPrice(e.price)}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar — total */}
          <div>
            <div className="sticky top-24">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-4">Предварительная оценка</h3>

                  {servicePrice > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>Услуга</span>
                      <span>от {formatPrice(servicePrice)}</span>
                    </div>
                  )}
                  {platformPrice > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>Платформа</span>
                      <span>+{formatPrice(platformPrice)}</span>
                    </div>
                  )}
                  {integrationsPrice > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>Интеграции</span>
                      <span>+{formatPrice(integrationsPrice)}</span>
                    </div>
                  )}
                  {extrasPrice > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>Допы</span>
                      <span>+{formatPrice(extrasPrice)}</span>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Итого</span>
                    <span className="text-primary">
                      {total > 0 ? `от ${formatPrice(total)}` : "—"}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Предварительная оценка. Точная стоимость — после обсуждения деталей.
                  </p>

                  <Button
                    className="w-full mt-4"
                    size="lg"
                    onClick={() => {
                      const params = new URLSearchParams()
                      if (selectedService) params.set("service", selectedService)
                      if (selectedPlatform) params.set("platform", selectedPlatform)
                      if (selectedIntegrations.length > 0) params.set("integrations", selectedIntegrations.join(","))
                      if (selectedExtras.length > 0) params.set("extras", selectedExtras.join(","))
                      if (total > 0) params.set("estimate", String(total))
                      router.push(`/brief?${params.toString()}`)
                    }}
                  >
                    Обсудить проект <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <div className="mt-4 text-center">
                <Badge variant="secondary" className="text-xs">
                  Цены в 5 раз ниже рынка
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
