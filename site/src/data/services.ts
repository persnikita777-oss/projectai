import {
  MessageSquare,
  Brain,
  Zap,
  Globe,
  Link,
  Lightbulb,
  type LucideIcon,
} from "lucide-react"

export interface Service {
  id: string
  title: string
  description: string
  price: string
  marketPrice: string
  timeline: string
  icon: LucideIcon
  features: string[]
  href: string
}

export const services: Service[] = [
  {
    id: "chatbot",
    title: "AI чат-бот",
    description:
      "Умный бот для Telegram, сайта или VK. Отвечает на вопросы, принимает заказы, квалифицирует лидов.",
    price: "от 30 000 ₽",
    marketPrice: "150–300 000 ₽",
    timeline: "3–5 дней",
    icon: MessageSquare,
    features: [
      "Telegram / сайт / VK",
      "Интеграция с CRM",
      "Обучение на ваших данных",
      "Аналитика диалогов",
    ],
    href: "/services/chatbot",
  },
  {
    id: "assistant",
    title: "AI-ассистент",
    description:
      "Корпоративный ассистент с доступом к вашей базе знаний. Ищет по документам, отвечает сотрудникам.",
    price: "от 70 000 ₽",
    marketPrice: "300–500 000 ₽",
    timeline: "1–2 недели",
    icon: Brain,
    features: [
      "RAG — поиск по документам",
      "Обучение на базе знаний",
      "Интеграция с 1С / CRM",
      "Мультимодельность",
    ],
    href: "/services/assistant",
  },
  {
    id: "automation",
    title: "Автоматизация",
    description:
      "AI-агент автоматизирует рутину: обработка заявок, документов, отчётов, поддержки клиентов.",
    price: "от 100 000 ₽",
    marketPrice: "500 000 – 1.5 млн ₽",
    timeline: "2–4 недели",
    icon: Zap,
    features: [
      "Автоматизация процессов",
      "Обработка документов",
      "AI-агенты",
      "Интеграция с любыми системами",
    ],
    href: "/services/automation",
  },
  {
    id: "website",
    title: "Сайт + AI",
    description:
      "Сайт-визитка, магазин или сервис с встроенными AI-функциями: чат, рекомендации, персонализация.",
    price: "от 20 000 ₽",
    marketPrice: "100–500 000 ₽",
    timeline: "2–7 дней",
    icon: Globe,
    features: [
      "Визитка / магазин / сервис",
      "AI-чат на сайте",
      "SEO-оптимизация",
      "Адаптивный дизайн",
    ],
    href: "/services/website",
  },
  {
    id: "integration",
    title: "Интеграция AI",
    description:
      "Подключим AI к вашим существующим системам: CRM, 1С, ERP, Битрикс, amoCRM.",
    price: "от 50 000 ₽",
    marketPrice: "250–500 000 ₽",
    timeline: "1–2 недели",
    icon: Link,
    features: [
      "CRM / 1С / ERP",
      "Битрикс24 / amoCRM",
      "Telegram / WhatsApp",
      "Любые REST API",
    ],
    href: "/services/consulting",
  },
  {
    id: "consulting",
    title: "AI-консалтинг",
    description:
      "Аудит процессов, стратегия внедрения AI, подбор моделей и инструментов для вашего бизнеса.",
    price: "от 10 000 ₽",
    marketPrice: "50–200 000 ₽",
    timeline: "1–3 дня",
    icon: Lightbulb,
    features: [
      "Аудит AI-готовности",
      "Стратегия внедрения",
      "Подбор моделей и стека",
      "Оценка ROI",
    ],
    href: "/services/consulting",
  },
]
