# Этап установки зависимостей
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Этап сборки
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Финальный образ
FROM node:20-alpine AS prod
WORKDIR /app

# Копируем только необходимое
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
# Копируем из deps, а не из контекста
COPY --from=deps /app/package.json ./
COPY .env ./

CMD ["node", "dist/app.js"]