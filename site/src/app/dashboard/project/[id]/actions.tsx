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

      {/* Step 3: Approve */}
      {status === "proposal" && hasProposal && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Если вас устраивает предложение — утвердите, и мы начнём разработку.
          </p>
          <Button onClick={() => doAction("approve")} disabled={loading !== null}>
            {loading === "approve" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Создание задач...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Утвердить и начать разработку</>
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
