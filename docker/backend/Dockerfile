# Dockerfile для Backend
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY backend/package*.json ./backend/

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY backend/ ./backend/
COPY recognition/ ./recognition/
COPY tsconfig*.json ./

# Собираем приложение
RUN npm run build:backend

# Экспонируем порт 8080
EXPOSE 8080

# Запускаем приложение
CMD ["npm", "run", "start:backend"]