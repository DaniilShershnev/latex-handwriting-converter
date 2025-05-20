/**
 * Сервис распознавания с поддержкой множества провайдеров
 * и возможностью фолбэка
 */
import { RecognitionProvider, RecognitionResult } from './types';

export class RecognitionServiceImpl {
  /**
   * Список доступных провайдеров
   */
  private providers: Map<string, RecognitionProvider> = new Map();

  /**
   * Создает новый экземпляр сервиса распознавания
   * @param initialProviders - Начальные провайдеры
   */
  constructor(initialProviders: RecognitionProvider[] = []) {
    // Регистрируем начальные провайдеры
    initialProviders.forEach(provider => {
      this.registerProvider(provider);
    });
  }

  /**
   * Регистрирует новый провайдер
   * @param provider - Провайдер для регистрации
   */
  public registerProvider(provider: RecognitionProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Удаляет провайдер по его идентификатору
   * @param providerId - Идентификатор провайдера
   */
  public unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }

  /**
   * Получает провайдер по его идентификатору
   * @param providerId - Идентификатор провайдера
   * @returns Найденный провайдер или undefined
   */
  public getProvider(providerId: string): RecognitionProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Возвращает список всех зарегистрированных провайдеров
   * @returns Массив провайдеров
   */
  public getAllProviders(): RecognitionProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Распознает математические формулы из изображения
   * @param imageData - Данные изображения в формате base64 или Blob
   * @param providerId - Необязательный идентификатор провайдера, если не указан, 
   *                     будет выбран первый доступный
   * @returns Результат распознавания
   */
  public async recognizeMath(
    imageData: string | Blob, 
    providerId?: string
  ): Promise<RecognitionResult> {
    try {
      // Если указан конкретный провайдер, пытаемся использовать его
      if (providerId) {
        const provider = this.providers.get(providerId);
        
        if (!provider) {
          throw new Error(`Provider with id ${providerId} not found`);
        }
        
        // Проверяем, доступен ли провайдер
        const isAvailable = await provider.isAvailable();
        
        if (!isAvailable) {
          throw new Error(`Provider ${provider.name} is not available`);
        }
        
        // Выполняем распознавание
        return await provider.recognizeMath(imageData);
      }
      
      // Если провайдер не указан, пробуем все доступные провайдеры
      const availableProviders = [];
      
      // Проверяем доступность всех провайдеров
      for (const provider of this.providers.values()) {
        try {
          const isAvailable = await provider.isAvailable();
          
          if (isAvailable) {
            availableProviders.push(provider);
          }
        } catch (error) {
          console.warn(`Failed to check availability of ${provider.name}:`, error);
        }
      }
      
      // Если нет доступных провайдеров, возвращаем ошибку
      if (availableProviders.length === 0) {
        return {
          success: false,
          confidence: 0,
          error: 'No available recognition providers'
        };
      }
      
      // Пробуем распознать с каждым доступным провайдером
      let lastError: string | undefined;
      
      for (const provider of availableProviders) {
        try {
          const result = await provider.recognizeMath(imageData);
          
          // Если распознавание успешно, возвращаем результат
          if (result.success) {
            return result;
          }
          
          // Иначе сохраняем ошибку и пробуем следующий провайдер
          lastError = result.error;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
          console.warn(`Error with provider ${provider.name}:`, error);
        }
      }
      
      // Если все провайдеры вернули ошибку, возвращаем последнюю
      return {
        success: false,
        confidence: 0,
        error: lastError || 'Recognition failed with all available providers'
      };
    } catch (error) {
      console.error('Recognition service error:', error);
      
      return {
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Распознает текст из изображения
   * @param imageData - Данные изображения в формате base64 или Blob
   * @param providerId - Необязательный идентификатор провайдера
   * @returns Результат распознавания
   */
  public async recognizeText(
    imageData: string | Blob, 
    providerId?: string
  ): Promise<RecognitionResult> {
    try {
      // Если указан конкретный провайдер, пытаемся использовать его
      if (providerId) {
        const provider = this.providers.get(providerId);
        
        if (!provider) {
          throw new Error(`Provider with id ${providerId} not found`);
        }
        
        // Проверяем, доступен ли провайдер
        const isAvailable = await provider.isAvailable();
        
        if (!isAvailable) {
          throw new Error(`Provider ${provider.name} is not available`);
        }
        
        // Выполняем распознавание
        return await provider.recognizeText(imageData);
      }
      
      // Если провайдер не указан, пробуем все доступные провайдеры
      const availableProviders = [];
      
      // Проверяем доступность всех провайдеров
      for (const provider of this.providers.values()) {
        try {
          const isAvailable = await provider.isAvailable();
          
          if (isAvailable) {
            availableProviders.push(provider);
          }
        } catch (error) {
          console.warn(`Failed to check availability of ${provider.name}:`, error);
        }
      }
      
      // Если нет доступных провайдеров, возвращаем ошибку
      if (availableProviders.length === 0) {
        return {
          success: false,
          confidence: 0,
          error: 'No available recognition providers'
        };
      }
      
      // Пробуем распознать с каждым доступным провайдером
      let lastError: string | undefined;
      
      for (const provider of availableProviders) {
        try {
          const result = await provider.recognizeText(imageData);
          
          // Если распознавание успешно, возвращаем результат
          if (result.success) {
            return result;
          }
          
          // Иначе сохраняем ошибку и пробуем следующий провайдер
          lastError = result.error;
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
          console.warn(`Error with provider ${provider.name}:`, error);
        }
      }
      
      // Если все провайдеры вернули ошибку, возвращаем последнюю
      return {
        success: false,
        confidence: 0,
        error: lastError || 'Recognition failed with all available providers'
      };
    } catch (error) {
      console.error('Recognition service error:', error);
      
      return {
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}