/**
 * Контроллер для сервиса распознавания
 */
import { Request, Response } from 'express';
import { RecognitionServiceImpl } from '../../modules/recognition';
import { SeshatProvider } from '../../modules/recognition/providers/SeshatProvider';
import { MathPixProvider } from '../../modules/recognition/providers/MathPixProvider';

/**
 * Контроллер для обработки запросов к API распознавания
 */
export class RecognitionController {
  private recognitionService: RecognitionServiceImpl;

  constructor() {
    // Инициализируем сервис распознавания с провайдером Seshat
    const seshatProvider = new SeshatProvider();
    this.recognitionService = new RecognitionServiceImpl([seshatProvider]);
    
    // Если указаны переменные окружения для MathPix, добавляем его как провайдер
    if (process.env.MATHPIX_APP_ID && process.env.MATHPIX_API_KEY) {
      const mathpixProvider = new MathPixProvider({
        appId: process.env.MATHPIX_APP_ID,
        apiKey: process.env.MATHPIX_API_KEY
      });
      this.recognitionService.registerProvider(mathpixProvider);
    }
  }

  /**
   * Распознаёт математические формулы из изображения
   */
  public recognizeMath = async (req: Request, res: Response): Promise<void> => {
    try {
      // Получаем изображение из файла или из base64 в теле запроса
      let imageData: Buffer | string;

      if (req.file) {
        // Данные из загруженного файла
        imageData = req.file.buffer;
      } else if (req.body.image) {
        // Данные из base64 в теле запроса
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
        imageData = Buffer.from(base64Data, 'base64');
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Image data is required' 
        });
        return;
      }

      // Получаем providerId из запроса, если указан
      const providerId = req.body.providerId as string | undefined;

      // Вызываем сервис распознавания
      const result = await this.recognitionService.recognizeMath(imageData, providerId);

      // Отправляем результат клиенту
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in recognizeMath:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Распознаёт текст из изображения
   */
  public recognizeText = async (req: Request, res: Response): Promise<void> => {
    try {
      // Получаем изображение из файла или из base64 в теле запроса
      let imageData: Buffer | string;

      if (req.file) {
        // Данные из загруженного файла
        imageData = req.file.buffer;
      } else if (req.body.image) {
        // Данные из base64 в теле запроса
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
        imageData = Buffer.from(base64Data, 'base64');
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Image data is required' 
        });
        return;
      }

      // Получаем providerId из запроса, если указан
      const providerId = req.body.providerId as string | undefined;

      // Вызываем сервис распознавания
      const result = await this.recognitionService.recognizeText(imageData, providerId);

      // Отправляем результат клиенту
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Error in recognizeText:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };

  /**
   * Получает список доступных провайдеров
   */
  public getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      // Получаем все провайдеры
      const providers = this.recognitionService.getAllProviders();
      
      // Преобразуем в безопасный для API формат
      const safeProviders = await Promise.all(
        providers.map(async (provider) => ({
          id: provider.id,
          name: provider.name,
          requiresCredentials: provider.requiresCredentials,
          isAvailable: await provider.isAvailable(),
          capabilities: provider.getCapabilities()
        }))
      );

      // Отправляем список провайдеров клиенту
      res.status(200).json({ 
        success: true, 
        providers: safeProviders 
      });
    } catch (error) {
      console.error('Error in getProviders:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
}