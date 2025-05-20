# Dockerfile для Frontend
FROM node:18-alpine as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY frontend/ ./frontend/
COPY tsconfig*.json ./

# Собираем приложение
RUN npm run build:frontend

# Этап 2: Используем Nginx для раздачи статических файлов
FROM nginx:alpine

# Копируем конфигурацию Nginx
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Экспонируем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]