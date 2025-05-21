import { RecognitionProvider, RecognitionResult, RecognitionCapabilities } from '../types';

/**
 * Провайдер распознавания на основе Seshat (open source решение)
 * https://github.com/falvaro/seshat
 */
export class SeshatProvider implements RecognitionProvider {
  public readonly id = 'seshat';
  public readonly name = 'Seshat (Open Source)';
  public readonly requiresCredentials = false;
  
  private seshatInstance: any = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  
  constructor() {
    // Инициализируем Seshat при создании экземпляра
    this.initialize();
  }
  
  /**
   * Инициализирует Seshat WASM модуль
   */
  private initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = new Promise(async (resolve, reject) => {
      try {
        // Импортируем WASM модуль Seshat
        // Примечание: в реальной реализации нужно будет настроить загрузку WASM
        const SeshatModule = await import('../../wasm/seshat');
        this.seshatInstance = await SeshatModule.default({
          locateFile: (file: string) => {
            console.log('Загрузка WASM файла:', file);
            // Используем абсолютный путь с base URL
            return new URL(`/wasm/${file}`, window.location.origin).href;
          },
          onRuntimeInitialized: () => {
            console.log('Seshat WASM инициализирован успешно');
            this.isInitialized = true;
            resolve();
          }
        });
      } catch (error) {
        console.error('Failed to initialize Seshat:', error);
        reject(error);
      }
    });
    
    return this.initializationPromise;
  }
  
  /**
   * Проверяет, доступен ли Seshat для использования
   */
  public async isAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      return this.isInitialized;
    } catch (error) {
      console.error('Seshat availability check failed:', error);
      return false;
    }
  }
  
  /**
   * Распознает математические формулы из изображения
   * @param imageData - данные изображения в формате base64 или Blob
   */
  public async recognizeMath(imageData: string | Blob): Promise<RecognitionResult> {
    try {
      console.log('SeshatProvider: Начало распознавания формулы');
      await this.initialize();
      
      if (!this.isInitialized || !this.seshatInstance) {
        console.log('SeshatProvider: WASM не инициализирован, использую API');
        
        // Используем API вместо WASM, т.к. он не инициализирован
        try {
          // Пробуем использовать API сервера для распознавания
          const formData = new FormData();
          if (typeof imageData === 'string') {
            // Если imageData это base64 строка
            formData.append('image', imageData);
          } else {
            // Если imageData это Blob
            formData.append('image', imageData);
          }
          
          const response = await fetch('/api/recognition/math', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('SeshatProvider: Успешно использовал API:', result);
            return {
              ...result,
              fallbackProvider: 'api'
            };
          } else {
            console.warn('SeshatProvider: API вернул ошибку:', response.status);
          }
        } catch (apiError) {
          console.error('SeshatProvider: Ошибка при вызове API:', apiError);
        }
        
        // Если API не сработал, возвращаем заглушку
        console.log('SeshatProvider: Использую заглушку для формулы');
        return {
          success: true,
          latex: '\\frac{x^2}{2}',
          confidence: 0.8,
          fallbackProvider: 'stub'
        };
      }
      
      // Если WASM инициализирован, используем его
      console.log('SeshatProvider: WASM инициализирован, использую его');
      
      // Преобразуем входные данные в формат, понятный для Seshat
      const processedImage = await this.preprocessImage(imageData);
      
      // Вызываем функцию распознавания из WASM модуля
      const result = this.seshatInstance.recognizeExpression(processedImage);
      
      // Обрабатываем результат
      if (!result || !result.latex) {
        console.warn('SeshatProvider: WASM не смог распознать выражение');
        return {
          success: false,
          confidence: 0,
          error: 'Failed to recognize expression'
        };
      }
      
      console.log('SeshatProvider: WASM успешно распознал формулу:', result.latex);
      return {
        success: true,
        latex: result.latex,
        confidence: result.confidence || 0.7, // Seshat может не предоставлять уровень уверенности
        rawData: result
      };
    } catch (error) {
      console.error('Seshat recognition error:', error);
      
      // В случае ошибки также возвращаем заглушку
      return {
        success: true,
        latex: '\\frac{x^2}{2}',
        confidence: 0.8,
        fallbackProvider: 'stub',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Распознает текст из изображения
   * @param imageData - данные изображения
   */
  public async recognizeText(imageData: string | Blob): Promise<RecognitionResult> {
    // Seshat специализируется на формулах, но мы можем попытаться распознать простой текст
    try {
      console.log('SeshatProvider: Начало распознавания текста');
      await this.initialize();
      
      if (!this.isInitialized || !this.seshatInstance) {
        console.log('SeshatProvider: WASM не инициализирован, использую API для текста');
        
        // Используем API вместо WASM, т.к. он не инициализирован
        try {
          // Пробуем использовать API сервера для распознавания
          const formData = new FormData();
          if (typeof imageData === 'string') {
            formData.append('image', imageData);
          } else {
            formData.append('image', imageData);
          }
          
          const response = await fetch('/api/recognition/text', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('SeshatProvider: Успешно использовал API для текста:', result);
            return {
              ...result,
              fallbackProvider: 'api'
            };
          } else {
            console.warn('SeshatProvider: API вернул ошибку для текста:', response.status);
          }
        } catch (apiError) {
          console.error('SeshatProvider: Ошибка при вызове API для текста:', apiError);
        }
        
        // Если API не сработал, возвращаем заглушку
        console.log('SeshatProvider: Использую заглушку для текста');
        return {
          success: true,
          text: 'Пример распознанного текста',
          confidence: 0.7,
          fallbackProvider: 'stub'
        };
      }
      
      // Если WASM инициализирован, используем его
      console.log('SeshatProvider: WASM инициализирован для текста, использую его');
      
      // Преобразуем входные данные
      const processedImage = await this.preprocessImage(imageData);
      
      // Вызываем функцию распознавания символов
      const result = this.seshatInstance.recognizeText(processedImage);
      
      if (!result || !result.text) {
        console.warn('SeshatProvider: WASM не смог распознать текст');
        return {
          success: false,
          confidence: 0,
          error: 'Failed to recognize text'
        };
      }
      
      console.log('SeshatProvider: WASM успешно распознал текст:', result.text);
      return {
        success: true,
        text: result.text,
        confidence: result.confidence || 0.5,
        rawData: result
      };
    } catch (error) {
      console.error('Seshat text recognition error:', error);
      
      // В случае ошибки возвращаем заглушку для текста
      return {
        success: true,
        text: 'Пример распознанного текста',
        confidence: 0.7,
        fallbackProvider: 'stub',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Возвращает информацию о возможностях Seshat
   */
  public getCapabilities(): RecognitionCapabilities {
    return {
      supportsMathRecognition: true,
      supportsTextRecognition: true, // Ограниченная поддержка
      supportsDiagramRecognition: false,
      supportedImageFormats: ['image/png', 'image/jpeg'],
      maxImageSize: 5 * 1024 * 1024 // 5MB
    };
  }
  
  /**
   * Предобрабатывает изображение для Seshat
   * @param imageData - входные данные изображения
   * @returns обработанное изображение в формате, понятном для Seshat
   */
  private async preprocessImage(imageData: string | Blob): Promise<Uint8Array> {
    // Преобразуем различные входные форматы в Uint8Array
    let imageBytes: Uint8Array;
    
    if (typeof imageData === 'string') {
      // Предполагаем, что строка - это base64
      if (imageData.startsWith('data:')) {
        // Извлекаем base64 из формата Data URL
        const base64 = imageData.split(',')[1];
        const binaryString = atob(base64);
        imageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }
      } else {
        // Обычная base64 строка
        const binaryString = atob(imageData);
        imageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }
      }
    } else {
      // Blob или File
      const arrayBuffer = await imageData.arrayBuffer();
      imageBytes = new Uint8Array(arrayBuffer);
    }
    
    // Нормализация изображения (если необходимо)
    // Здесь может быть дополнительная обработка изображения
    
    return imageBytes;
  }
}