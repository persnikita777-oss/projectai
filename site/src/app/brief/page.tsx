"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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

function BriefForm() {
  const searchParams = useSearchParams()
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [telegram, setTelegram] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

  // Предзаполняем из параметров калькулятора
  useEffect(() => {
    const services = searchParams.get("services")
    const estimate = searchParams.get("estimate")
    const platform = searchParams.get("platform")
    const integrations = searchParams.get("integrations")
    const extras = searchParams.get("extras")

    if (services) {
      setSelectedServices(services.split(","))
    }

    if (estimate) {
      const val = parseInt(estimate, 10)
      if (val < 30000) setSelectedBudget("under30")
      else if (val < 70000) setSelectedBudget("30-70")
      else if (val < 150000) setSelectedBudget("70-150")
      else setSelectedBudget("150plus")
    }

    const parts: string[] = []
    if (platform) parts.push(`Платформа: ${platform}`)
    if (integrations) parts.push(`Интеграции: ${integrations}`)
    if (extras) parts.push(`Доп. услуги: ${extras}`)
    if (estimate) parts.push(`Оценка калькулятора: от ${parseInt(estimate, 10).toLocaleString("ru-RU")} ₽`)
    if (parts.length > 0) {
      setDescription(parts.join("\n"))
    }
  }, [searchParams])

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: selectedServices,
          description,
          budget: selectedBudget,
          timeline: selectedTimeline,
          name,
          company,
          telegram,
          email,
          estimate: searchParams.get("estimate"),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка")
      if (data.credentials) {
        setCredentials(data.credentials)
      }
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="py-16 md:py-24">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 mb-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Заявка отправлена</h1>
          <p className="text-muted-foreground mb-4">
            Мы получили вашу заявку и начнём работу. Следите за прогрессом в личном кабинете.
          </p>

          {credentials && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium mb-3 text-center">Данные для входа в личный кабинет:</p>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between bg-background rounded px-3 py-2">
                  <span className="text-muted-foreground">Логин:</span>
                  <code className="font-mono">{credentials.email}</code>
                </div>
                <div className="flex items-center justify-between bg-background rounded px-3 py-2">
                  <span className="text-muted-foreground">Пароль:</span>
                  <code className="font-mono">{credentials.password}</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Сохраните эти данные — они понадобятся для входа
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild>
              <a href="/login">
                Войти в личный кабинет
              </a>
            </Button>
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

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Опишите задачу</h2>
                <Textarea
                  placeholder="Чем занимается ваш бизнес? Какую проблему хотите решить? Какой результат ожидаете?"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </CardContent>
            </Card>

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

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-bold mb-3">Контактные данные</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Имя *</label>
                    <Input
                      placeholder="Как к вам обращаться"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Компания</label>
                    <Input
                      placeholder="Название компании"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Telegram *</label>
                    <Input
                      placeholder="@username"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email *</label>
                    <Input
                      placeholder="email@company.ru"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Используется для входа в личный кабинет</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {status === "error" && (
              <p className="text-sm text-red-500 text-center">Ошибка отправки. Попробуйте ещё раз.</p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
              <Send className="mr-2 h-4 w-4" />
              {status === "sending" ? "Отправка..." : "Отправить заявку"}
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

export default function BriefPage() {
  return (
    <Suspense>
      <BriefForm />
    </Suspense>
  )
}
