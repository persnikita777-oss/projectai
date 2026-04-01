"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ChevronRight, ChevronLeft, Check, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  projectId: string
  serviceType: string
  existingAnswers?: Record<string, unknown>
}

const colorPalettes = [
  { id: "blue", label: "Синий / Деловой", colors: ["#1e40af", "#3b82f6", "#93c5fd"] },
  { id: "green", label: "Зелёный / Эко", colors: ["#15803d", "#22c55e", "#86efac"] },
  { id: "purple", label: "Фиолетовый / Креатив", colors: ["#7e22ce", "#a855f7", "#d8b4fe"] },
  { id: "red", label: "Красный / Энергия", colors: ["#dc2626", "#f87171", "#fca5a5"] },
  { id: "dark", label: "Тёмный / Премиум", colors: ["#0f172a", "#334155", "#94a3b8"] },
  { id: "warm", label: "Тёплый / Уютный", colors: ["#c2410c", "#f97316", "#fed7aa"] },
  { id: "custom", label: "Свои цвета", colors: [] },
]

const styleOptions = [
  { id: "minimal", label: "Минимализм", desc: "Чистый дизайн, много воздуха" },
  { id: "corporate", label: "Корпоративный", desc: "Строгий, профессиональный" },
  { id: "creative", label: "Креативный", desc: "Нестандартный, яркий" },
  { id: "tech", label: "Технологичный", desc: "Современный, цифровой" },
]

const siteBlocks = [
  { id: "hero", label: "Главный экран (Hero)" },
  { id: "about", label: "О компании / О нас" },
  { id: "services", label: "Услуги / Продукты" },
  { id: "portfolio", label: "Портфолио / Кейсы" },
  { id: "pricing", label: "Цены / Тарифы" },
  { id: "testimonials", label: "Отзывы клиентов" },
  { id: "team", label: "Команда" },
  { id: "faq", label: "Частые вопросы (FAQ)" },
  { id: "blog", label: "Блог / Статьи" },
  { id: "contacts", label: "Контакты / Форма связи" },
  { id: "cta", label: "Призыв к действию (CTA)" },
  { id: "calculator", label: "Калькулятор / Конфигуратор" },
]

const steps = [
  { id: "style", title: "Стиль и дизайн" },
  { id: "colors", title: "Цветовая схема" },
  { id: "structure", title: "Структура" },
  { id: "content", title: "Контент и детали" },
  { id: "references", title: "Референсы" },
]

export function TZQuestionnaire({ projectId, serviceType, existingAnswers }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Answers state
  const [style, setStyle] = useState<string>(existingAnswers?.style as string || "")
  const [styleComment, setStyleComment] = useState(existingAnswers?.styleComment as string || "")
  const [palette, setPalette] = useState<string>(existingAnswers?.palette as string || "")
  const [customColors, setCustomColors] = useState(existingAnswers?.customColors as string || "")
  const [logoUrl, setLogoUrl] = useState(existingAnswers?.logoUrl as string || "")
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>(existingAnswers?.blocks as string[] || ["hero", "about", "services", "contacts"])
  const [customBlocks, setCustomBlocks] = useState(existingAnswers?.customBlocks as string || "")
  const [businessDesc, setBusinessDesc] = useState(existingAnswers?.businessDesc as string || "")
  const [targetAudience, setTargetAudience] = useState(existingAnswers?.targetAudience as string || "")
  const [competitors, setCompetitors] = useState(existingAnswers?.competitors as string || "")
  const [references, setReferences] = useState(existingAnswers?.references as string || "")
  const [wishes, setWishes] = useState(existingAnswers?.wishes as string || "")

  const toggleBlock = (id: string) => {
    setSelectedBlocks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const answers = {
    style, styleComment, palette, customColors, logoUrl,
    blocks: selectedBlocks, customBlocks,
    businessDesc, targetAudience, competitors, references, wishes,
  }

  const saveAnswers = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-tz-answers", answers }),
      })
      if (!res.ok) throw new Error("Ошибка сохранения")
    } catch {
      setError("Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  const generateTZ = async () => {
    setGenerating(true)
    setError(null)
    try {
      // Save answers first
      await fetch(`/api/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-tz-answers", answers }),
      })
      // Generate TZ from answers
      const res = await fetch(`/api/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-tz" }),
      })
      if (!res.ok) throw new Error("Ошибка генерации")
      router.refresh()
    } catch {
      setError("Ошибка генерации ТЗ")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { saveAnswers(); setStep(i) }}
            className={`px-2 py-1 rounded transition-colors ${i === step ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Step 0: Style */}
      {step === 0 && (
        <div className="grid gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Стиль дизайна</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {styleOptions.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${style === s.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                >
                  <div className="flex items-center gap-2">
                    {style === s.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Комментарий к стилю</Label>
            <Textarea
              value={styleComment}
              onChange={e => setStyleComment(e.target.value)}
              placeholder="Опишите своими словами, как должен выглядеть проект..."
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Step 1: Colors */}
      {step === 1 && (
        <div className="grid gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Цветовая схема</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {colorPalettes.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${palette === p.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                >
                  <div className="flex items-center gap-2">
                    {palette === p.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    <span>{p.label}</span>
                    {p.colors.length > 0 && (
                      <div className="flex gap-1 ml-auto">
                        {p.colors.map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {palette === "custom" && (
            <div>
              <Label className="text-sm font-medium mb-1 block">Ваши цвета</Label>
              <Input
                value={customColors}
                onChange={e => setCustomColors(e.target.value)}
                placeholder="#FF5733, #3498DB, #2ECC71 или словами: бирюзовый, белый"
              />
            </div>
          )}
          <div>
            <Label className="text-sm font-medium mb-1 block">Логотип</Label>
            <Input
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="Ссылка на логотип (Google Drive, Dropbox, или URL)"
            />
            <p className="text-xs text-muted-foreground mt-1">Загрузите логотип в облако и вставьте ссылку. Или отправьте нам в Telegram.</p>
          </div>
        </div>
      )}

      {/* Step 2: Structure */}
      {step === 2 && (
        <div className="grid gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Какие блоки нужны?</Label>
            <p className="text-xs text-muted-foreground mb-3">Выберите нужные. Можно добавить свои ниже.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {siteBlocks.map(b => (
                <button
                  key={b.id}
                  onClick={() => toggleBlock(b.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors text-left ${selectedBlocks.includes(b.id) ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                >
                  {selectedBlocks.includes(b.id) && <Check className="h-4 w-4 text-primary shrink-0" />}
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Свои блоки / страницы</Label>
            <Textarea
              value={customBlocks}
              onChange={e => setCustomBlocks(e.target.value)}
              placeholder="Опишите дополнительные разделы, которые нужны..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Step 3: Content */}
      {step === 3 && (
        <div className="grid gap-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">О вашем бизнесе</Label>
            <Textarea
              value={businessDesc}
              onChange={e => setBusinessDesc(e.target.value)}
              placeholder="Чем занимается компания? Какие продукты/услуги? Какая миссия?"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Целевая аудитория</Label>
            <Textarea
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="Кто ваши клиенты? Возраст, интересы, проблемы..."
              rows={2}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Конкуренты</Label>
            <Input
              value={competitors}
              onChange={e => setCompetitors(e.target.value)}
              placeholder="Ссылки на сайты конкурентов или их названия"
            />
          </div>
        </div>
      )}

      {/* Step 4: References */}
      {step === 4 && (
        <div className="grid gap-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">Референсы</Label>
            <Textarea
              value={references}
              onChange={e => setReferences(e.target.value)}
              placeholder="Ссылки на сайты, которые нравятся. Что именно в них хорошо?"
              rows={3}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Дополнительные пожелания</Label>
            <Textarea
              value={wishes}
              onChange={e => setWishes(e.target.value)}
              placeholder="Всё, что хотите добавить: особые функции, ограничения, предпочтения..."
              rows={3}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { saveAnswers(); setStep(s => s - 1) }}
          disabled={step === 0 || saving}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Назад
        </Button>

        <div className="flex gap-2">
          {step < steps.length - 1 ? (
            <Button
              size="sm"
              onClick={() => { saveAnswers(); setStep(s => s + 1) }}
              disabled={saving}
            >
              Далее <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={generateTZ}
              disabled={generating || saving}
            >
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация ТЗ...</>
              ) : (
                <><Check className="mr-2 h-4 w-4" /> Сформировать ТЗ</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
