FROM node:22.16-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:22.16-alpine AS build

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY package*.json ./

COPY . .

RUN npm run build

FROM node:22.16-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodejs

USER nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["next", "start"]