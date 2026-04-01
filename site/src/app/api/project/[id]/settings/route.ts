import { NextResponse, type NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET — получить настройки проекта
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: settings } = await supabaseAdmin
    .from("pai_project_settings")
    .select("*")
    .eq("project_id", id)
    .single()

  return NextResponse.json(settings || { project_id: id, hosting_type: "vercel", api_keys: {}, deploy_status: "pending" })
}

// POST — сохранить настройки проекта
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const { domain, hosting_type, github_repo, server_host, server_user, server_path, api_keys } = body

  // Check if settings exist
  const { data: existing } = await supabaseAdmin
    .from("pai_project_settings")
    .select("id")
    .eq("project_id", id)
    .single()

  const settingsData = {
    project_id: id,
    domain: domain || null,
    hosting_type: hosting_type || "vercel",
    github_repo: github_repo || null,
    server_host: server_host || null,
    server_user: server_user || "root",
    server_path: server_path || null,
    api_keys: api_keys || {},
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await supabaseAdmin
      .from("pai_project_settings")
      .update(settingsData)
      .eq("project_id", id)
  } else {
    await supabaseAdmin
      .from("pai_project_settings")
      .insert(settingsData)
  }

  return NextResponse.json({ ok: true })
}
