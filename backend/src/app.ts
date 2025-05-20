/**
 * Точка входа для Backend Express сервера
 */
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

// Конфигурация .env
dotenv.config();

// Импортируем маршруты
import apiRoutes from './api/routes';

// Настройка Express
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '8080', 10);
const isDevelopment: boolean = process.env.NODE_ENV !== 'production';

// Middlewares
app.use(express.json({ limit: '10mb' })); // Лимит для JSON-запросов
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet()); // Безопасность заголовков

// Логирование только в режиме разработки
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting для защиты от DoS-атак
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  limit: 100, // Лимит запросов на IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Применяем rate limiting к маршрутам API
app.use('/api/', limiter);

// Маршруты API
app.use('/api', apiRoutes);

// Раздача статических файлов в производственном режиме
if (!isDevelopment) {
  // Статические файлы из папки dist (клиентское приложение)
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// Middleware для обработки ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 
    message: err.message,
    stack: isDevelopment ? err.stack : undefined
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;