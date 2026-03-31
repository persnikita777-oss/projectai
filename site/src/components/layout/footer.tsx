import Link from "next/link"

const links = {
  services: [
    { label: "AI чат-боты", href: "/services/chatbot" },
    { label: "AI-ассистенты", href: "/services/assistant" },
    { label: "Автоматизация", href: "/services/automation" },
    { label: "Сайты + AI", href: "/services/website" },
    { label: "AI-консалтинг", href: "/services/consulting" },
  ],
  company: [
    { label: "О нас", href: "/about" },
    { label: "Портфолио", href: "/portfolio" },
    { label: "Блог", href: "/blog" },
    { label: "Контакты", href: "/contact" },
  ],
  resources: [
    { label: "Обучение", href: "/learn" },
    { label: "Калькулятор", href: "/estimate" },
    { label: "Обсудить проект", href: "/brief" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="font-bold text-lg">
              <span className="text-primary">Project</span>AI
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              AI-разработка в 5 раз дешевле рынка. Боты, сайты, автоматизация — от 20 000 ₽.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Услуги</h3>
            <ul className="space-y-2">
              {links.services.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Компания</h3>
            <ul className="space-y-2">
              {links.company.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Ресурсы</h3>
            <ul className="space-y-2">
              {links.resources.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ProjectAI. Все права защищены.
          </p>
          <p className="text-sm text-muted-foreground">
            Хочешь делать такие проекты сам?{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Научим →
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
