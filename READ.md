# Рукописный конвертер в LaTeX

Веб-приложение для создания рукописных математических формул и конвертации их в LaTeX с использованием свободного ПО.

## Особенности

- ✍️ Рукописный ввод с поддержкой стилусов
- 🧮 Распознавание математических формул
- 📝 Конвертация в LaTeX и PDF
- 🔌 Модульная архитектура с возможностью подключения разных систем распознавания
- 🔄 Бесплатное распознавание с использованием Seshat
- 🔑 Опциональная интеграция с MathPix API (требуется API-ключ)

## Требования

- Node.js 18 или выше
- npm 8 или выше
- MongoDB (опционально, для сохранения документов)
- Docker и Docker Compose (опционально, для контейнеризации)

## Установка и запуск

### Опция 1: Локальный запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/username/handwriting-latex-converter.git
cd handwriting-latex-converter
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` в корневой директории проекта:

```
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/latex-converter
JWT_SECRET=your_secret_key_here
# Опционально для MathPix
# MATHPIX_APP_ID=your_app_id
# MATHPIX_API_KEY=your_api_key
```

4. Запустите приложение в режиме разработки:

```bash
npm run dev
```

Это запустит фронтенд на порту 3000 и бэкенд на порту 8080.

### Опция 2: Запуск с использованием Docker

1. Клонируйте репозиторий:

```bash
git clone https://github.com/username/handwriting-latex-converter.git
cd handwriting-latex-converter
```

2. Соберите и запустите контейнеры:

```bash
docker-compose up --build
```

Приложение будет доступно по адресу http://localhost.

## Структура проекта

```
handwriting-latex-converter/
├── frontend/            # React приложение
├── backend/             # Node.js сервер
├── recognition/         # Модуль распознавания
├── docker/              # Docker конфигурации
└── docs/                # Документация
```

## Как использовать

1. Откройте приложение в браузере
2. Выберите режим ввода (текст или формула)
3. Нарисуйте формулу или текст на холсте
4. Нажмите кнопку "Распознать"
5. Отредактируйте распознанный LaTeX-код, если необходимо
6. Экспортируйте документ в PDF

## Интеграция с MathPix

Для улучшенного распознавания можно использовать MathPix API:

1. Зарегистрируйтесь на [mathpix.com](https://mathpix.com/) и получите API-ключ
2. Добавьте учетные данные в форму в приложении или в файл `.env`
3. Выберите MathPix в качестве провайдера распознавания

## Разработка

### Запуск тестов

```bash
npm test
```

### Линтинг кода

```bash
npm run lint
```

### Сборка для продакшена

```bash
npm run build
```

## Лицензия

Этот проект распространяется под лицензией MIT.