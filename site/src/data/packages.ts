export interface Package {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}

export const packages: Package[] = [
  {
    name: "Lite",
    price: "от 20 000 ₽",
    description: "Бот, сайт-визитка или лендинг",
    features: [
      "1 продукт",
      "Базовый функционал",
      "1 итерация правок",
      "Деплой на сервер",
    ],
  },
  {
    name: "Standard",
    price: "от 70 000 ₽",
    description: "AI-ассистент, магазин или сервис",
    features: [
      "AI-ассистент / магазин / сервис",
      "Интеграция с 1–2 системами",
      "2 итерации правок",
      "1 месяц поддержки",
    ],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "от 150 000 ₽",
    description: "Сложный сервис или мультиагентная система",
    features: [
      "Любая сложность",
      "Любые интеграции",
      "3 итерации правок",
      "3 месяца поддержки + SLA",
    ],
  },
]
