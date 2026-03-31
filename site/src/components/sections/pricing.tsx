import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { packages } from "@/data/packages"
import { cn } from "@/lib/utils"

export function Pricing() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Пакеты</h2>
          <p className="mt-3 text-muted-foreground">
            Прозрачные цены. Никаких скрытых платежей.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={cn(
                "relative",
                pkg.highlighted && "border-primary shadow-lg"
              )}
            >
              {pkg.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Популярный
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <p className="text-2xl font-bold text-primary mt-2">{pkg.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={pkg.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/brief">Обсудить</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
