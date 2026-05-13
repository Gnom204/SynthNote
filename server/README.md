# SynthNote API

## Запуск

### Docker Compose

Запуск всего приложения (Postgres, API, фронт через nginx) — из **корня репозитория** `synth-note`:

1. Файл `.env` в корне репозитория (рядом с `docker-compose.yml`). Учётные данные БД в нём должны совпадать с тем, с чем **первый раз** инициализировался том Postgres; при смене пользователя/БД выполни `docker compose down -v` и подними снова.
2. `docker compose up --build`
3. Веб: `http://localhost:8080`, health API: `http://localhost:8000/health`

### Локально через uv

1. Убедись, что установлен `uv`.
2. Установи зависимости:
   - `uv sync --no-dev`
3. Запуск:
   - `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`

## JWT и обновление токена

Все защищённые эндпоинты требуют заголовок:

`Authorization: Bearer <access_token>`

**Refresh token:**
Веб-клиент (React Web)

- При логине/регистрации передавай заголовок `X-Client-Type: web`
- Refresh token будет храниться в httpOnly cookie
- Для обновления токена вызывай `POST /api/v1/auth/refresh` с cookie

## CORS

В `main.py` используется `allow_origins=settings.CORS_ORIGINS` и `allow_origin_regex=settings.CORS_ORIGINS_REGEX`.

Development (dev/prod разделить через `.env`):

- `CORS_ORIGINS` примерно: `http://localhost:3000`, `http://localhost:5173`, `http://localhost:8081`, `exp://localhost:8081`

Production:

- Укажи реальные домены в `CORS_ORIGINS` или `CORS_ORIGINS_REGEX`

## Swagger/OpenAPI

Документация доступна по:

- `http://localhost:8000/docs`
