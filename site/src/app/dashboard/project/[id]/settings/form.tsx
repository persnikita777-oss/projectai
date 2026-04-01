"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, CheckCircle, Server, Globe } from "lucide-react"

interface Settings {
  domain?: string
  hosting_type?: string
  github_repo?: string
  server_host?: string
  server_user?: string
  server_path?: string
  api_keys?: Record<string, string>
  deploy_status?: string
  deploy_url?: string
}

export function SettingsForm({ projectId, initialSettings }: { projectId: string; initialSettings: Settings | null }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hosting, setHosting] = useState(initialSettings?.hosting_type || "vercel")
  const [domain, setDomain] = useState(initialSettings?.domain || "")
  const [githubRepo, setGithubRepo] = useState(initialSettings?.github_repo || "")
  const [serverHost, setServerHost] = useState(initialSettings?.server_host || "")
  const [serverUser, setServerUser] = useState(initialSettings?.server_user || "root")
  const [serverPath, setServerPath] = useState(initialSettings?.server_path || "")

  const apiKeys = initialSettings?.api_keys || {}
  const [vercelToken, setVercelToken] = useState(apiKeys.vercel_token || "")
  const [openaiKey, setOpenaiKey] = useState(apiKeys.openai_key || "")

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/project/${projectId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          hosting_type: hosting,
          github_repo: githubRepo,
          server_host: serverHost,
          server_user: serverUser,
          server_path: serverPath,
          api_keys: {
            vercel_token: vercelToken,
            openai_key: openaiKey,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hosting type */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Хостинг</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHosting("vercel")}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
              hosting === "vercel" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <Globe className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">Vercel</div>
              <div className="text-xs text-muted-foreground">Авто-деплой, CDN</div>
            </div>
          </button>
          <button
            onClick={() => setHosting("server")}
            className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
              hosting === "server" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <Server className="h-4 w-4" />
            <div className="text-left">
              <div className="font-medium">VPS / Сервер</div>
              <div className="text-xs text-muted-foreground">Свой сервер, SSH</div>
            </div>
          </button>
        </div>
      </div>

      {/* Domain */}
      <div>
        <Label htmlFor="domain" className="text-sm font-medium">Домен</Label>
        <Input
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">Оставьте пустым для использования домена по умолчанию</p>
      </div>

      {/* GitHub repo */}
      <div>
        <Label htmlFor="repo" className="text-sm font-medium">GitHub репозиторий</Label>
        <Input
          id="repo"
          value={githubRepo}
          onChange={(e) => setGithubRepo(e.target.value)}
          placeholder="owner/repo-name"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">Формат: owner/repo или полный URL</p>
      </div>

      {/* Vercel settings */}
      {hosting === "vercel" && (
        <div>
          <Label htmlFor="vercel" className="text-sm font-medium">Vercel Token</Label>
          <Input
            id="vercel"
            type="password"
            value={vercelToken}
            onChange={(e) => setVercelToken(e.target.value)}
            placeholder="Токен из vercel.com/account/tokens"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Если не указан — будет использован токен студии
          </p>
        </div>
      )}

      {/* Server settings */}
      {hosting === "server" && (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="host" className="text-sm font-medium">Хост сервера</Label>
            <Input
              id="host"
              value={serverHost}
              onChange={(e) => setServerHost(e.target.value)}
              placeholder="123.45.67.89"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="user" className="text-sm font-medium">Пользователь</Label>
              <Input
                id="user"
                value={serverUser}
                onChange={(e) => setServerUser(e.target.value)}
                placeholder="root"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="path" className="text-sm font-medium">Путь на сервере</Label>
              <Input
                id="path"
                value={serverPath}
                onChange={(e) => setServerPath(e.target.value)}
                placeholder="/var/www/project"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div>
        <Label htmlFor="openai" className="text-sm font-medium">OpenAI API Key</Label>
        <Input
          id="openai"
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          placeholder="sk-..."
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Для AI-функций в вашем проекте. Не обязательно — можно использовать ключ студии
        </p>
      </div>

      {/* Deploy status */}
      {initialSettings?.deploy_status === "deployed" && initialSettings?.deploy_url && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="text-sm">
            <span className="font-medium text-green-800">Задеплоен: </span>
            <a href={initialSettings.deploy_url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
              {initialSettings.deploy_url}
            </a>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Сохранить настройки</>
          )}
        </Button>
        {saved && <span className="text-sm text-green-600">Сохранено</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </div>
  )
}
