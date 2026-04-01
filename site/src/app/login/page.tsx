"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        if (error.message.includes("Invalid login")) {
          setErrorMsg("Неверный email или пароль")
        } else {
          setErrorMsg(error.message)
        }
        setStatus("error")
        return
      }
      router.push("/dashboard")
    } catch {
      setErrorMsg("Ошибка авторизации")
      setStatus("error")
    }
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-md px-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> На главную
          </Link>
        </div>
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-6">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground text-sm">
                Введите email и пароль из заявки
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="you@company.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Пароль</label>
                  <Input
                    type="password"
                    placeholder="Пароль из заявки"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-500">{errorMsg}</p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? "Вход..." : "Войти"}
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Логин и пароль выдаются при отправке заявки.
              <br />
              Нет аккаунта? <Link href="/brief" className="text-primary underline">Оставить заявку</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
