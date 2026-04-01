import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const ADMIN_CHAT = process.env.ADMIN_ID

// POST — запустить деплой проекта
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: project } = await supabaseAdmin
    .from("pai_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (!["review", "done"].includes(project.status)) {
    return NextResponse.json({ error: "Проект ещё не готов к деплою" }, { status: 400 })
  }

  const { data: settings } = await supabaseAdmin
    .from("pai_project_settings")
    .select("*")
    .eq("project_id", id)
    .single()

  if (!settings) {
    return NextResponse.json({ error: "Сначала заполните настройки проекта" }, { status: 400 })
  }

  // Update deploy status
  await supabaseAdmin
    .from("pai_project_settings")
    .update({ deploy_status: "deploying", updated_at: new Date().toISOString() })
    .eq("project_id", id)

  try {
    let deployUrl = ""

    if (settings.hosting_type === "vercel") {
      deployUrl = await deployToVercel(project, settings)
    } else if (settings.hosting_type === "server") {
      deployUrl = await deployToServer(project, settings)
    } else {
      deployUrl = settings.domain || "custom deployment"
    }

    // Update settings with result
    await supabaseAdmin
      .from("pai_project_settings")
      .update({
        deploy_status: "deployed",
        deploy_url: deployUrl,
        deployed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", id)

    // Update project status to done
    await supabaseAdmin
      .from("pai_projects")
      .update({ status: "done", updated_at: new Date().toISOString() })
      .eq("id", id)

    await notify(
      `🚀 Проект "${project.title}" задеплоен!\n` +
      `URL: ${deployUrl}\n` +
      `Хостинг: ${settings.hosting_type}`
    )

    return NextResponse.json({ ok: true, url: deployUrl })
  } catch (e) {
    await supabaseAdmin
      .from("pai_project_settings")
      .update({ deploy_status: "failed", updated_at: new Date().toISOString() })
      .eq("project_id", id)

    const errorMessage = e instanceof Error ? e.message : String(e)
    await notify(`❌ Деплой ошибка: "${project.title}"\n${errorMessage}`)

    return NextResponse.json({ error: `Ошибка деплоя: ${errorMessage}` }, { status: 500 })
  }
}

// GET — статус деплоя
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: settings } = await supabaseAdmin
    .from("pai_project_settings")
    .select("deploy_status, deploy_url, deployed_at")
    .eq("project_id", id)
    .single()

  return NextResponse.json(settings || { deploy_status: "pending" })
}

// --- Vercel deploy ---
async function deployToVercel(
  project: Record<string, unknown>,
  settings: Record<string, unknown>
): Promise<string> {
  const apiKeys = (settings.api_keys as Record<string, string>) || {}
  const vercelToken = apiKeys.vercel_token || process.env.VERCEL_TOKEN

  if (!vercelToken) {
    throw new Error("Vercel token не указан. Добавьте в настройках проекта.")
  }

  // Create deployment via Vercel API
  const repoUrl = settings.github_repo as string
  if (!repoUrl) {
    throw new Error("GitHub репозиторий не указан в настройках")
  }

  // Extract owner/repo from URL or string
  const repoMatch = repoUrl.match(/(?:github\.com\/)?([^/]+\/[^/]+?)(?:\.git)?$/)
  if (!repoMatch) {
    throw new Error("Неверный формат GitHub репозитория")
  }

  const repo = repoMatch[1]

  // Create deployment
  const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: (project.title as string || "project").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50),
      gitSource: {
        type: "github",
        repo,
        ref: "main",
      },
      projectSettings: {
        framework: "nextjs",
      },
    }),
  })

  if (!deployRes.ok) {
    const err = await deployRes.text()
    throw new Error(`Vercel API: ${err}`)
  }

  const deploy = await deployRes.json()
  let deployUrl = `https://${deploy.url}`

  // If domain specified — add alias
  const domain = settings.domain as string
  if (domain) {
    try {
      await fetch(`https://api.vercel.com/v10/projects/${deploy.projectId}/domains`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      })
      deployUrl = `https://${domain}`
    } catch {
      // Domain add failed, use default URL
    }
  }

  return deployUrl
}

// --- Server deploy (SSH) ---
async function deployToServer(
  project: Record<string, unknown>,
  settings: Record<string, unknown>
): Promise<string> {
  const serverHost = settings.server_host as string
  const serverPath = settings.server_path as string
  const repoUrl = settings.github_repo as string

  if (!serverHost) throw new Error("Хост сервера не указан")
  if (!repoUrl) throw new Error("GitHub репозиторий не указан")

  const domain = settings.domain as string
  const deployPath = serverPath || `/var/www/${(project.title as string || "project").toLowerCase().replace(/[^a-z0-9-]/g, "-")}`

  // Store deployment info for agent to pick up
  await supabaseAdmin
    .from("pai_project_settings")
    .update({
      api_keys: {
        ...((settings.api_keys as Record<string, string>) || {}),
        _deploy_config: JSON.stringify({
          host: serverHost,
          user: settings.server_user || "root",
          path: deployPath,
          repo: repoUrl,
          domain: domain,
        }),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", project.id)

  return domain ? `https://${domain}` : `http://${serverHost}`
}

async function notify(text: string) {
  if (!ADMIN_CHAT) return
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_CHAT, text, parse_mode: "HTML" }),
    })
  } catch { /* silent */ }
}
