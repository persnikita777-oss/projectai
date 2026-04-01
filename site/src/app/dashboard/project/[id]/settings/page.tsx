import { redirect, notFound } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SettingsForm } from "./form"

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Verify project belongs to user
  const { data: client } = await supabaseAdmin
    .from("pai_clients")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (!client) redirect("/dashboard")

  const { data: project } = await supabaseAdmin
    .from("pai_projects")
    .select("id, title, status")
    .eq("id", id)
    .eq("client_id", client.id)
    .single()

  if (!project) notFound()

  // Get existing settings
  const { data: settings } = await supabaseAdmin
    .from("pai_project_settings")
    .select("*")
    .eq("project_id", id)
    .single()

  return (
    <div className="py-8 md:py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <Link href={`/dashboard/project/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Назад к проекту
        </Link>

        <h1 className="text-2xl font-bold mb-2">Настройки деплоя</h1>
        <p className="text-sm text-muted-foreground mb-6">{project.title}</p>

        <Card>
          <CardContent className="py-6">
            <SettingsForm projectId={id} initialSettings={settings} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
