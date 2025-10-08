FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json .
RUN npm install 

RUN npm uninstall nodemon

COPY src ./src

RUN npm run build 

FROM node:22-slim
WORKDIR /app

COPY package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 7003
CMD [ "npm", "run", "start" ]