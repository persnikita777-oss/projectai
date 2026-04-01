"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, DollarSign, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  projectId: string
  status: string
  hasTZ: boolean
  hasProposal: boolean
}

export function ProjectActions({ projectId, status, hasTZ, hasProposal }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const doAction = async (action: string) => {
    setLoading(action)
    setError(null)
    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Step 1: Generate TZ */}
      {status === "brief" && (
        <Button onClick={() => doAction("generate-tz")} disabled={loading !== null}>
          {loading === "generate-tz" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация ТЗ...</>
          ) : (
            <><FileText className="mr-2 h-4 w-4" /> Сформировать ТЗ</>
          )}
        </Button>
      )}

      {/* Step 2: Generate Proposal */}
      {status === "tz" && hasTZ && (
        <Button onClick={() => doAction("generate-proposal")} disabled={loading !== null}>
          {loading === "generate-proposal" ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Генерация КП...</>
          ) : (
            <><DollarSign className="mr-2 h-4 w-4" /> Получить коммерческое предложение</>
          )}
        </Button>
      )}

      {/* Step 3: Approve */}
      {status === "proposal" && hasProposal && (
        <div className="flex gap-2">
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
        <p className="text-sm text-muted-foreground">Проект в разработке. Задачи выполняются автоматически.</p>
      )}
    </div>
  )
}
