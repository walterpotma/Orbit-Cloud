FROM node:22.16-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22.16-alpine AS builder

WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
RUN npm run build

FROM node:22.16-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000


CMD ["npm", "start"]
