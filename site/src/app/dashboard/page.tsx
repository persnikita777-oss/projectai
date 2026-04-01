import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, LogOut, Clock, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { LogoutButton } from "./logout-button"

const statusLabels: Record<string, { label: string; color: string }> = {
  brief: { label: "Бриф", color: "bg-gray-100 text-gray-700" },
  tz: { label: "Составление ТЗ", color: "bg-blue-100 text-blue-700" },
  proposal: { label: "Коммерческое предложение", color: "bg-purple-100 text-purple-700" },
  approved: { label: "Утверждён", color: "bg-green-100 text-green-700" },
  development: { label: "В разработке", color: "bg-yellow-100 text-yellow-700" },
  review: { label: "На проверке", color: "bg-orange-100 text-orange-700" },
  revision: { label: "Правки", color: "bg-red-100 text-red-700" },
  done: { label: "Готов", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Отменён", color: "bg-gray-100 text-gray-500" },
}

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Get or create client profile
  let { data: client } = await supabaseAdmin
    .from("pai_clients")
    .select("*")
    .eq("auth_id", user.id)
    .single()

  if (!client) {
    // Try to find by email (may exist without auth_id)
    const { data: byEmail } = await supabaseAdmin
      .from("pai_clients")
      .select("*")
      .eq("email", user.email)
      .single()

    if (byEmail) {
      // Link existing client to auth
      await supabaseAdmin
        .from("pai_clients")
        .update({ auth_id: user.id, updated_at: new Date().toISOString() })
        .eq("id", byEmail.id)
      client = { ...byEmail, auth_id: user.id }
    } else {
      // Create new client profile
      const { data: newClient } = await supabaseAdmin
        .from("pai_clients")
        .insert({
          auth_id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Клиент",
          email: user.email,
        })
        .select("*")
        .single()
      client = newClient
    }
  }

  // Get projects
  const clientId = client?.id
  const { data: projects } = clientId
    ? await supabaseAdmin
        .from("pai_projects")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
    : { data: [] }

  const activeProjects = (projects || []).filter((p) => !["done", "cancelled"].includes(p.status))
  const completedProjects = (projects || []).filter((p) => p.status === "done")

  return (
    <div className="py-8 md:py-16">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Мои проекты</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/brief">
                <Plus className="mr-1 h-4 w-4" /> Новый проект
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

        {/* Active projects */}
        {activeProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4" /> Активные
            </h2>
            <div className="grid gap-3">
              {activeProjects.map((project) => {
                const st = statusLabels[project.status] || statusLabels.brief
                return (
                  <Link key={project.id} href={`/dashboard/project/${project.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(project.created_at).toLocaleDateString("ru-RU")}
                              {project.estimate_amount && ` · от ${project.estimate_amount.toLocaleString("ru-RU")} ₽`}
                            </p>
                          </div>
                        </div>
                        <Badge className={st.color}>{st.label}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Завершённые
            </h2>
            <div className="grid gap-3">
              {completedProjects.map((project) => (
                <Link key={project.id} href={`/dashboard/project/${project.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer opacity-70">
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">{project.title}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Готов</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!projects || projects.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-4">
                <FolderOpen className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Пока нет проектов</h2>
              <p className="text-muted-foreground mb-4">
                Оставьте заявку — мы подготовим предложение
              </p>
              <Button asChild>
                <Link href="/brief">
                  <Plus className="mr-2 h-4 w-4" /> Создать проект
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Helpful info */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Быстрый старт</p>
              <p className="text-xs text-muted-foreground">MVP за 3-14 дней</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Прозрачность</p>
              <p className="text-xs text-muted-foreground">Статус в реальном времени</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <FolderOpen className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Все файлы</p>
              <p className="text-xs text-muted-foreground">Доступ к ТЗ, КП, коду</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
