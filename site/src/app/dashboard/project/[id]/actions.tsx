"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, DollarSign, CheckCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  projectId: string
  status: string
  hasTZ: boolean
  hasProposal: boolean
  tzText?: string
}

export function ProjectActions({ projectId, status, hasTZ, hasProposal, tzText }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingTZ, setEditingTZ] = useState(false)
  const [tzDraft, setTzDraft] = useState(tzText || "")
  const [saved, setSaved] = useState(false)

  const doAction = async (action: string, extraData?: Record<string, unknown>) => {
    setLoading(action)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extraData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка")
      if (action === "save-tz") {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        router.refresh()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Step: Edit TZ + Request Proposal */}
      {status === "tz" && hasTZ && (
        <div className="flex flex-col gap-3">
          {!editingTZ ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Проверьте и при необходимости отредактируйте ТЗ. Когда всё готово — запросите коммерческое предложение.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setEditingTZ(true)}>
                  <FileText className="mr-2 h-4 w-4" /> Редактировать ТЗ
                </Button>
                <Button onClick={() => doAction("generate-proposal")} disabled={loading !== null}>
                  {loading === "generate-proposal" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация КП и плана...</>
                  ) : (
                    <><DollarSign className="mr-2 h-4 w-4" /> ТЗ готово → Получить КП и план</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Textarea
                value={tzDraft}
                onChange={(e) => setTzDraft(e.target.value)}
                rows={15}
                className="text-sm font-mono"
                style={{ fontSize: "14px" }}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => doAction("save-tz", { tz: tzDraft })}
                  disabled={loading !== null}
                >
                  {loading === "save-tz" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Сохранить</>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingTZ(false)}>
                  Закрыть редактор
                </Button>
                {saved && <span className="text-sm text-green-600 self-center">Сохранено</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Approve proposal → contract */}
      {status === "proposal" && hasProposal && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Если вас устраивает предложение — утвердите. Далее: подписание договора и предоплата 50%.
          </p>
          <Button onClick={() => doAction("approve-proposal")} disabled={loading !== null}>
            {loading === "approve-proposal" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Подготовка договора...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Утвердить КП</>
            )}
          </Button>
        </div>
      )}

      {/* Step 4: Contract */}
      {status === "contract" && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Договор подготовлен. Ознакомьтесь с условиями и подтвердите.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm mb-3 space-y-2">
            <p><b>Основные условия:</b></p>
            <p>• Стоимость: {hasProposal ? "согласно КП" : "—"}</p>
            <p>• Предоплата: 50% до начала работ</p>
            <p>• Оставшиеся 50% — после сдачи проекта</p>
            <p>• Гарантия: 1 месяц бесплатной поддержки</p>
            <p>• До 3 итераций правок включено</p>
            <p>• Исходный код передаётся клиенту</p>
          </div>
          <Button onClick={() => doAction("sign-contract")} disabled={loading !== null}>
            {loading === "sign-contract" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Обработка...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Подписать договор</>
            )}
          </Button>
        </div>
      )}

      {/* Step 5: Payment */}
      {status === "payment" && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Договор подписан. Для начала разработки необходима предоплата 50%.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm mb-3">
            <p>Оплата будет доступна после подключения платёжной системы.</p>
            <p className="mt-1">Пока что свяжитесь с нами в <a href="https://t.me/projectai_bot" target="_blank" rel="noopener noreferrer" className="text-primary underline">Telegram</a> для оплаты.</p>
          </div>
          <Button onClick={() => doAction("confirm-payment")} disabled={loading !== null}>
            {loading === "confirm-payment" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Подтверждение...</>
            ) : (
              <><DollarSign className="mr-2 h-4 w-4" /> Я оплатил</>
            )}
          </Button>
        </div>
      )}

      {/* In development */}
      {status === "development" && (
        <p className="text-sm text-muted-foreground">
          Проект в разработке. Задачи выполняются автоматически. Прогресс отображается ниже.
        </p>
      )}

      {/* Review */}
      {status === "review" && (
        <p className="text-sm text-muted-foreground">
          Все задачи выполнены. Проект на проверке — мы свяжемся с вами для презентации.
        </p>
      )}
    </div>
  )
}
