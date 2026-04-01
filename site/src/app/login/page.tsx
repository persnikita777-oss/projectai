"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Check, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div className="py-16 md:py-24">
        <div className="container mx-auto max-w-md px-4">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary/10 mb-4">
                <Check className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Письмо отправлено</h1>
              <p className="text-muted-foreground mb-4">
                Мы отправили ссылку для входа на <b>{email}</b>
              </p>
              <p className="text-sm text-muted-foreground">
                Проверьте почту и перейдите по ссылке. Письмо может попасть в спам.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground text-sm">
                Введите email — мы отправим ссылку для входа
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
                {status === "error" && (
                  <p className="text-sm text-red-500">Ошибка отправки. Попробуйте ещё раз.</p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
                  {status === "sending" ? "Отправка..." : "Войти по email"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
