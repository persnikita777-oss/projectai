"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Send, Clock, MessageSquare } from "lucide-react"

const serviceOptions = [
  { id: "chatbot", label: "AI чат-бот" },
  { id: "website", label: "Сайт + AI" },
  { id: "assistant", label: "AI-ассистент" },
  { id: "automation", label: "Автоматизация" },
  { id: "integration", label: "Интеграция AI" },
  { id: "consulting", label: "AI-консалтинг" },
  { id: "other", label: "Другое" },
]

const budgetOptions = [
  { id: "under30", label: "до 30 000 ₽" },
  { id: "30-70", label: "30 000 – 70 000 ₽" },
  { id: "70-150", label: "70 000 – 150 000 ₽" },
  { id: "150plus", label: "от 150 000 ₽" },
  { id: "unknown", label: "Не определился" },
]

const timelineOptions = [
  { id: "asap", label: "Как можно скорее" },
  { id: "week", label: "В течение недели" },
  { id: "month", label: "В течение месяца" },
  { id: "planning", label: "Планирую на будущее" },
]

export default function BriefPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="py-16 md:py-24">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 mb-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Заявка отправлена</h1>
          <p className="text-muted-foreground mb-6">
            Мы получили вашу заявку и ответим в течение 30 минут в рабочее время.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <a href="https://t.me/projectai_bot" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Написать в Telegram
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Бриф</Badge>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            Расскажите о проекте
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Заполните бриф — мы подготовим оценку стоимости и сроков
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Заполнение займёт 2-3 минуты
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Service type */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Что нужно сделать?</h2>
                <p className="text-sm text-muted-foreground mb-4">Можно выбрать несколько</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {serviceOptions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                        selectedServices.includes(s.id) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      {selectedServices.includes(s.id) && <Check className="h-4 w-4 text-primary shrink-0" />}
                      {s.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Опишите задачу</h2>
                <Textarea
                  placeholder="Чем занимается ваш бизнес? Какую проблему хотите решить? Какой результат ожидаете?"
                  rows={5}
                />
              </CardContent>
            </Card>

            {/* Budget */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Бюджет</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {budgetOptions.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBudget(b.id)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                        selectedBudget === b.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      {selectedBudget === b.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                      {b.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Сроки</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {timelineOptions.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTimeline(t.id)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary ${
                        selectedTimeline === t.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      {selectedTimeline === t.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Contact info */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Контактные данные</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Имя *</label>
                    <Input placeholder="Как к вам обращаться" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Компания</label>
                    <Input placeholder="Название компании" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Telegram *</label>
                    <Input placeholder="@username" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input placeholder="email@company.ru" type="email" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Отправить заявку
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Мы ответим в течение 30 минут в рабочее время (9:00–21:00 МСК)
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
