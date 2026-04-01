"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"

const nav = [
  { label: "Услуги", href: "/services" },
  { label: "Портфолио", href: "/portfolio" },
  { label: "Обучение", href: "/learn" },
  { label: "Блог", href: "/blog" },
  { label: "О нас", href: "/about" },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1 font-bold text-xl">
          <span className="text-primary">Project</span>
          <span>AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard"><User className="mr-1 h-4 w-4" /> ЛК</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/estimate">Калькулятор</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/brief">Обсудить проект</Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background">
          <nav className="flex flex-col p-4 gap-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium py-2 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-2" />
            <Button variant="ghost" asChild>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <User className="mr-1 h-4 w-4" /> Личный кабинет
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/estimate" onClick={() => setOpen(false)}>
                Калькулятор
              </Link>
            </Button>
            <Button asChild>
              <Link href="/brief" onClick={() => setOpen(false)}>
                Обсудить проект
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
