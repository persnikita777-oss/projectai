import { redirect, notFound } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FileText, CheckCircle, Circle, Loader2, Settings, Rocket } from "lucide-react"
import Link from "next/link"
import { ProjectActions } from "./actions"
import { DeployButton } from "./deploy-button"
import { TZQuestionnaire } from "./tz-questionnaire"

const statusLabels: Record<string, { label: string; color: string; step: number }> = {
  brief: { label: "Бриф получен", color: "bg-gray-100 text-gray-700", step: 1 },
  tz: { label: "Составление ТЗ", color: "bg-blue-100 text-blue-700", step: 2 },
  proposal: { label: "КП готово", color: "bg-purple-100 text-purple-700", step: 3 },
  approved: { label: "Утверждён", color: "bg-green-100 text-green-700", step: 4 },
  development: { label: "В разработке", color: "bg-yellow-100 text-yellow-700", step: 5 },
  review: { label: "На проверке", color: "bg-orange-100 text-orange-700", step: 6 },
  revision: { label: "Правки", color: "bg-red-100 text-red-700", step: 6 },
  done: { label: "Готов", color: "bg-green-100 text-green-800", step: 7 },
}

const stages = [
  { step: 1, label: "Заявка" },
  { step: 2, label: "ТЗ" },
  { step: 3, label: "КП" },
  { step: 4, label: "Утверждение" },
  { step: 5, label: "Разработка" },
  { step: 6, label: "Проверка" },
  { step: 7, label: "Запуск" },
]

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
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
    .select("*")
    .eq("id", id)
    .eq("client_id", client.id)
    .single()

  if (!project) notFound()

  // Get settings
  const { data: settings } = await supabaseAdmin
    .from("pai_project_settings")
    .select("deploy_status, deploy_url, deployed_at")
    .eq("project_id", id)
    .single()

  // Get tasks
  const { data: tasks } = await supabaseAdmin
    .from("pai_tasks")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true })

  const st = statusLabels[project.status] || statusLabels.brief
  const currentStep = st.step

  const tasksDone = (tasks || []).filter((t) => t.status === "done").length
  const tasksTotal = (tasks || []).length

  return (
    <div className="py-8 md:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Мои проекты
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{project.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Создан {new Date(project.created_at).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/project/${id}/settings`}>
              <Button variant="outline" size="icon" title="Настройки деплоя">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Badge className={st.color}>{st.label}</Badge>
          </div>
        </div>

        {/* Progress bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              {stages.map((stage) => (
                <div key={stage.step} className="flex flex-col items-center gap-1">
                  {stage.step < currentStep ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : stage.step === currentStep ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                  )}
                  <span className={`text-[10px] sm:text-xs ${stage.step <= currentStep ? "text-foreground font-medium" : "text-muted-foreground/50"}`}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project details */}
        <div className="grid gap-4">
          {/* Info */}
          <Card>
            <CardContent className="py-4">
              <h3 className="font-semibold mb-3">Детали проекта</h3>
              <div className="grid gap-2 text-sm">
                {project.service_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Услуга</span>
                    <span>{project.service_type}</span>
                  </div>
                )}
                {project.platform && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Платформа</span>
                    <span>{project.platform}</span>
                  </div>
                )}
                {project.estimate_amount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Оценка</span>
                    <span>от {project.estimate_amount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                {project.proposal_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Стоимость (КП)</span>
                    <span className="font-medium">{project.proposal_price.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                {project.budget_range && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Бюджет</span>
                    <span>{project.budget_range}</span>
                  </div>
                )}
                {project.timeline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сроки</span>
                    <span>{project.timeline}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {project.description && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold mb-2">Описание</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>
          )}

          {/* TZ Questionnaire (for brief status) */}
          {project.status === "brief" && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Заполните опросник для ТЗ
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ответьте на вопросы — AI сформирует детальное ТЗ на основе ваших предпочтений.
                </p>
                <TZQuestionnaire
                  projectId={project.id}
                  serviceType={project.service_type}
                  existingAnswers={project.tz_answers || undefined}
                />
              </CardContent>
            </Card>
          )}

          {/* TZ (collapsible when proposal exists) */}
          {project.tz_text && project.status !== "brief" && (
            <Card>
              <CardContent className="py-4">
                <details open={!project.proposal_text}>
                  <summary className="font-semibold cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Техническое задание
                    {project.proposal_text && (
                      <span className="text-xs text-muted-foreground font-normal ml-auto">нажмите чтобы развернуть</span>
                    )}
                  </summary>
                  <div className="text-sm whitespace-pre-wrap mt-3">{project.tz_text}</div>
                </details>
              </CardContent>
            </Card>
          )}

          {/* Proposal */}
          {project.proposal_text && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold mb-2">Коммерческое предложение</h3>
                <div className="text-sm whitespace-pre-wrap">{project.proposal_text}</div>
              </CardContent>
            </Card>
          )}

          {/* Actions (not for brief — questionnaire handles that) */}
          {!["done", "cancelled", "brief"].includes(project.status) && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold mb-3">Следующий шаг</h3>
                <ProjectActions
                  projectId={project.id}
                  status={project.status}
                  hasTZ={!!project.tz_text}
                  hasProposal={!!project.proposal_text}
                  tzText={project.tz_text || ""}
                />
              </CardContent>
            </Card>
          )}

          {/* Deploy */}
          {["review", "done"].includes(project.status) && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Rocket className="h-4 w-4" /> Деплой
                </h3>
                {settings?.deploy_status === "deployed" && settings?.deploy_url ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Задеплоен: </span>
                    <a href={settings.deploy_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                      {settings.deploy_url}
                    </a>
                  </div>
                ) : (
                  <DeployButton projectId={id} deployStatus={settings?.deploy_status || "pending"} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Tasks */}
          {tasksTotal > 0 && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-semibold mb-3">
                  Задачи ({tasksDone}/{tasksTotal})
                </h3>
                <div className="grid gap-2">
                  {(tasks || []).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      {task.status === "done" ? (
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      ) : task.status === "in_progress" ? (
                        <Loader2 className="h-4 w-4 text-yellow-500 animate-spin shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                      )}
                      <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
