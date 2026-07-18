FROM docker.m.daocloud.io/library/node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM docker.m.daocloud.io/library/node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* 变量在构建期内联进产物，运行时改环境变量无效
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM docker.m.daocloud.io/library/node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/lib/db/migrations ./lib/db/migrations

EXPOSE 3000

CMD ["node", "server.js"]
