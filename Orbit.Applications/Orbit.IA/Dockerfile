FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY src ./src
COPY tsconfig.json ./
COPY .env ./

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/app.js"]