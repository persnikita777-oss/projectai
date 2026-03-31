import { Badge } from "@/components/ui/badge"

const rows = [
  {
    service: "AI чат-бот",
    us: "от 30K",
    market: "150–300K",
    freelance: "20–50K",
    usDays: "3–5 дн",
    marketDays: "4–8 нед",
  },
  {
    service: "Сайт-визитка",
    us: "от 20K",
    market: "100–300K",
    freelance: "15–40K",
    usDays: "2–3 дн",
    marketDays: "3–6 нед",
  },
  {
    service: "AI-ассистент",
    us: "от 70K",
    market: "300–500K",
    freelance: "—",
    usDays: "1–2 нед",
    marketDays: "1–3 мес",
  },
  {
    service: "Автоматизация",
    us: "от 100K",
    market: "500K–1.5M",
    freelance: "—",
    usDays: "2–4 нед",
    marketDays: "2–6 мес",
  },
]

export function Comparison() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Сравните сами</h2>
          <p className="mt-3 text-muted-foreground">
            Наши цены vs рынок. Та же работа — в 5 раз дешевле и быстрее.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Услуга</th>
                <th className="text-left py-3 px-4 font-medium">
                  <Badge>ProjectAI</Badge>
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Студии
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Фрилансеры
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Badge variant="secondary">Наш срок</Badge>
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  Срок студий
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.service} className="border-b last:border-0">
                  <td className="py-3 px-4 font-medium">{r.service}</td>
                  <td className="py-3 px-4 font-bold text-primary">{r.us}</td>
                  <td className="py-3 px-4 text-muted-foreground line-through">{r.market}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.freelance}</td>
                  <td className="py-3 px-4 font-medium">{r.usDays}</td>
                  <td className="py-3 px-4 text-muted-foreground">{r.marketDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
