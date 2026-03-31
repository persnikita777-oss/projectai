import { steps } from "@/data/steps"

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Как мы работаем</h2>
          <p className="mt-3 text-muted-foreground">
            8 шагов от заявки до готового продукта. AI ведёт проект, вы контролируете.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative p-6 rounded-xl border bg-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {step.number}
                </span>
                <span className="text-xs text-muted-foreground">{step.duration}</span>
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
