/**
 * Маршруты для сервиса распознавания
 */
import express from 'express';
import multer from 'multer';
import { RecognitionController } from './controller';
import { validateRecognitionRequest } from '../../middleware/validators';

const router = express.Router();
const controller = new RecognitionController();

// Настройка multer для хранения загруженных изображений в памяти
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимальный размер файла
  }
});

/**
 * @route POST /api/recognition/math
 * @desc Распознавание математических формул
 * @access Public (в базовой версии)
 */
router.post(
  '/math',
  upload.single('image'),
  validateRecognitionRequest,
  controller.recognizeMath
);

/**
 * @route POST /api/recognition/text
 * @desc Распознавание текста
 * @access Public (в базовой версии)
 */
router.post(
  '/text',
  upload.single('image'),
  validateRecognitionRequest,
  controller.recognizeText
);

/**
 * @route GET /api/recognition/providers
 * @desc Получение списка доступных провайдеров
 * @access Public
 */
router.get('/providers', controller.getProviders);

export default router;