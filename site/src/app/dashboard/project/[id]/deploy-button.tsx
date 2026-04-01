"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Rocket, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function DeployButton({ projectId, deployStatus }: { projectId: string; deployStatus: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/project/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка деплоя")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка")
    } finally {
      setLoading(false)
    }
  }

  if (deployStatus === "deploying") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Деплой в процессе...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Все задачи выполнены. Настройте параметры деплоя и запустите публикацию.
      </p>
      <div className="flex gap-2">
        <Link href={`/dashboard/project/${projectId}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" /> Настройки
          </Button>
        </Link>
        <Button size="sm" onClick={handleDeploy} disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Деплой...</>
          ) : (
            <><Rocket className="mr-2 h-4 w-4" /> Запустить деплой</>
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {deployStatus === "failed" && !error && (
        <p className="text-sm text-red-500">Предыдущий деплой завершился с ошибкой. Проверьте настройки и попробуйте снова.</p>
      )}
    </div>
  )
}
