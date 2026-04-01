# ProjectAI Agent — инструментарий

Агент ProjectAI выполняет полный цикл: проектирование → разработка → деплой.

## Инструменты

### 1. Проектирование
- **analyze-brief** — анализ брифа клиента, выявление требований
- **generate-tz** — генерация технического задания из брифа
- **generate-proposal** — расчёт стоимости и сроков, формирование КП
- **decompose-tasks** — декомпозиция ТЗ на задачи разработки

### 2. Документация
- **create-readme** — генерация README.md проекта
- **create-api-docs** — документирование API endpoints
- **create-architecture** — описание архитектуры (стек, схема БД, API)

### 3. Разработка
- **scaffold-project** — создание скелета проекта (Next.js / Node.js / Python)
- **implement-feature** — реализация конкретной фичи по задаче
- **write-tests** — написание тестов
- **fix-bug** — диагностика и исправление бага
- **code-review** — ревью кода перед деплоем

### 4. Инфраструктура
- **setup-db** — создание таблиц в Supabase
- **setup-env** — настройка переменных окружения
- **setup-domain** — подключение домена (DNS + Vercel/сервер)

### 5. Деплой
- **deploy-vercel** — деплой на Vercel (статика, SSR)
- **deploy-server** — деплой на VDS (SSH, Docker, PM2)
- **setup-ci** — настройка CI/CD (GitHub Actions)

### 6. Мониторинг
- **health-check** — проверка доступности сервисов
- **check-logs** — анализ ошибок в логах
- **update-status** — обновление статуса задачи/проекта в Supabase

## Конфигурация

Все инструменты используют:
- **Supabase** — БД, auth, хранение файлов
- **OpenAI API** — генерация ТЗ, КП, кода
- **Telegram Bot API** — уведомления
- **Vercel CLI** — деплой статики/SSR
- **SSH** — деплой на VDS
- **GitHub API** — работа с репозиториями

## Таблицы Supabase

```sql
pai_clients — клиенты (id, auth_id, name, email, telegram, company)
pai_projects — проекты (id, client_id, title, status, service_type, tz_text, proposal_text, dev_plan)
pai_tasks — задачи (id, project_id, title, description, status, sort_order, result)
```

Статусы проекта: brief → tz → proposal → approved → development → review → revision → done
Статусы задачи: pending → in_progress → done | blocked

## Воронка

```
Калькулятор (/estimate) → Бриф (/brief) → ЛК (/dashboard)
                                              ↓
                                        Бриф получен
                                              ↓
                                      AI генерирует ТЗ
                                              ↓
                                      AI генерирует КП
                                              ↓
                                    Клиент утверждает
                                              ↓
                                AI декомпозирует на задачи
                                              ↓
                                  Агент выполняет задачи
                                              ↓
                                    Проверка + правки
                                              ↓
                                  Деплой + подключение
```
