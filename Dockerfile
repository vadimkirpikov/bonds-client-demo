ARG NODE_VERSION=22.17.0
FROM node:${NODE_VERSION} AS base
WORKDIR /usr/src/app

FROM base AS deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

FROM deps AS build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_LEGAL_FIO
ARG NEXT_PUBLIC_LEGAL_INN
ARG NEXT_PUBLIC_LEGAL_EMAIL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_LEGAL_FIO=$NEXT_PUBLIC_LEGAL_FIO
ENV NEXT_PUBLIC_LEGAL_INN=$NEXT_PUBLIC_LEGAL_INN
ENV NEXT_PUBLIC_LEGAL_EMAIL=$NEXT_PUBLIC_LEGAL_EMAIL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

ENV MONGODB_URI="mongodb://mock-for-build:27017/db"
ENV API_PUBLIC_EMAIL="build@mock.com"
ENV API_PUBLIC_PASSWORD="mock"

RUN npm run build

FROM base AS final

ENV NODE_ENV=production

USER node

COPY package.json .

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]
