import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChatWidget } from "@/components/chat-widget"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "ProjectAI — AI-разработка в 5 раз дешевле",
    template: "%s | ProjectAI",
  },
  description:
    "Боты, сайты, автоматизация с искусственным интеллектом — от 20 000 ₽. Цены в 5 раз ниже рынка. AI сам пишет код, тестирует и деплоит.",
  keywords: [
    "AI разработка",
    "чат-бот",
    "искусственный интеллект",
    "автоматизация бизнеса",
    "AI ассистент",
    "разработка сайтов",
  ],
  openGraph: {
    title: "ProjectAI — AI-разработка в 5 раз дешевле",
    description:
      "Боты, сайты, автоматизация с AI — от 20 000 ₽. Опишите проект — получите оценку за 5 минут.",
    type: "website",
    locale: "ru_RU",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}
