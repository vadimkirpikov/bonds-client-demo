# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.17.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION} AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Create a stage for installing production dependecies.
FROM base AS deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Create a stage for building the application.
FROM deps AS build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

# --- FIX START ---
# Принимаем публичный URL как аргумент сборки (он нужен реальный)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_LEGAL_FIO
ARG NEXT_PUBLIC_LEGAL_INN
ARG NEXT_PUBLIC_LEGAL_EMAIL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

# --- И прокидываем их в ENV на этапе сборки ---
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_LEGAL_FIO=$NEXT_PUBLIC_LEGAL_FIO
ENV NEXT_PUBLIC_LEGAL_INN=$NEXT_PUBLIC_LEGAL_INN
ENV NEXT_PUBLIC_LEGAL_EMAIL=$NEXT_PUBLIC_LEGAL_EMAIL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Устанавливаем переменные окружения для процесса сборки
# 1. NEXT_PUBLIC_API_URL "запекается" в клиентский код, поэтому берем из ARG

# 2. Серверные переменные нужны только чтобы пройти проверку "if (!URI) throw"
# Реальное подключение к БД во время билда не происходит, поэтому ставим заглушки.
# В Runtime (при запуске контейнера) они заменятся на настоящие из docker-compose.
ENV MONGODB_URI="mongodb://mock-for-build:27017/db"
ENV API_PUBLIC_EMAIL="build@mock.com"
ENV API_PUBLIC_PASSWORD="mock"
# --- FIX END ---

RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
FROM base AS final

ENV NODE_ENV=production

USER node

COPY package.json .

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]