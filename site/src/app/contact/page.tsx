"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, Clock, Check } from "lucide-react"

const contacts = [
  {
    icon: MessageSquare,
    title: "Telegram",
    value: "@projectai_bot",
    href: "https://t.me/projectai_bot",
    description: "Быстрый способ связаться",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@projectai.ru",
    href: "mailto:hello@projectai.ru",
    description: "Для официальных запросов",
  },
  {
    icon: Clock,
    title: "Время ответа",
    value: "до 30 минут",
    description: "В рабочее время (9:00–21:00 МСК)",
  },
]

export default function ContactPage() {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Контакты</Badge>
          <h1 className="text-3xl font-bold md:text-5xl mb-4">
            Свяжитесь с нами
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Расскажите о проекте — мы ответим в течение 30 минут
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {contacts.map((c) => {
            const Icon = c.icon
            return (
              <Card key={c.title}>
                <CardContent className="pt-6 text-center">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold">{c.title}</p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="text-primary hover:underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="text-sm text-primary">{c.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Contact form */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-6">Написать нам</h2>
            {status === "sent" ? (
              <div className="text-center py-8">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <p className="font-semibold text-lg mb-1">Сообщение отправлено</p>
                <p className="text-sm text-muted-foreground">Мы ответим в течение 30 минут</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Имя</label>
                    <Input
                      placeholder="Как к вам обращаться"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email или Telegram</label>
                    <Input
                      placeholder="Куда ответить"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Сообщение</label>
                  <Textarea
                    placeholder="Расскажите о проекте или задайте вопрос"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-500">Ошибка отправки. Попробуйте ещё раз.</p>
                )}
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "sending"}>
                  {status === "sending" ? "Отправка..." : "Отправить"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
