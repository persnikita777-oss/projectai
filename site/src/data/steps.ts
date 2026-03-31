export interface Step {
  number: number
  title: string
  description: string
  duration: string
}

export const steps: Step[] = [
  {
    number: 1,
    title: "Заявка",
    description: "Опишите проект в AI-чате — получите оценку за 5 минут",
    duration: "5 мин",
  },
  {
    number: 2,
    title: "Техническое задание",
    description: "AI формирует ТЗ на основе диалога. Вы проверяете и вносите правки",
    duration: "1 день",
  },
  {
    number: 3,
    title: "Коммерческое предложение",
    description: "Стоимость, сроки, стек. Прозрачная цена — без скрытых платежей",
    duration: "1 день",
  },
  {
    number: 4,
    title: "План разработки",
    description: "Декомпозиция на задачи с дедлайнами. Утверждаете — стартуем",
    duration: "1 день",
  },
  {
    number: 5,
    title: "Разработка",
    description: "AI пишет код, тестирует, деплоит. Прогресс в реальном времени в ЛК",
    duration: "3–14 дней",
  },
  {
    number: 6,
    title: "Презентация",
    description: "Демо на preview-сервере. Отчёт: что сделано, скриншоты, метрики",
    duration: "1 день",
  },
  {
    number: 7,
    title: "Правки",
    description: "Вносите замечания — AI исправляет. До 3 итераций в базовом пакете",
    duration: "1–3 дня",
  },
  {
    number: 8,
    title: "Запуск",
    description: "Деплой на продакшн, передача исходников, документация",
    duration: "1 день",
  },
]
