/**
 * Маршруты API для сервера Express
 */
import express from 'express';
import authRoutes from './auth/routes';
import documentRoutes from './document/routes';
import recognitionRoutes from './recognition/routes';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Middleware для проверки API health
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Маршруты аутентификации (без защиты JWT)
router.use('/auth', authRoutes);

// Маршруты, защищенные JWT
router.use('/documents', authenticateJWT, documentRoutes);

// Маршруты распознавания (для базовой версии без JWT)
// В полной версии лучше защитить этот endpoint
router.use('/recognition', recognitionRoutes);

export default router;