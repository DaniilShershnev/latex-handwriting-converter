// api/index.js
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Тестовый маршрут
app.get('/api', (req, res) => {
  res.json({ message: 'API работает!' });
});

// Маршрут для распознавания
app.post('/api/recognition/math', (req, res) => {
  // В будущем здесь будет интеграция с Seshat
  // Пока возвращаем тестовый ответ
  res.json({
    success: true,
    latex: '\\frac{x^2 + y^2}{2}',
    confidence: 0.9
  });
});

// Маршрут для распознавания текста
app.post('/api/recognition/text', (req, res) => {
  res.json({
    success: true,
    text: 'Распознанный текст',
    confidence: 0.8
  });
});

// Экспортируем приложение для Vercel
module.exports = app;