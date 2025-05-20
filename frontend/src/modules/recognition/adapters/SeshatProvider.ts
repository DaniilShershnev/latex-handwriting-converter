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
          locateFile: (file: string) => `/wasm/${file}`,
          onRuntimeInitialized: () => {
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
      await this.initialize();
      
      if (!this.isInitialized || !this.seshatInstance) {
        throw new Error('Seshat is not initialized');
      }
      
      // Преобразуем входные данные в формат, понятный для Seshat
      const processedImage = await this.preprocessImage(imageData);
      
      // Вызываем функцию распознавания из WASM модуля
      const result = this.seshatInstance.recognizeExpression(processedImage);
      
      // Обрабатываем результат
      if (!result || !result.latex) {
        return {
          success: false,
          confidence: 0,
          error: 'Failed to recognize expression'
        };
      }
      
      return {
        success: true,
        latex: result.latex,
        confidence: result.confidence || 0.7, // Seshat может не предоставлять уровень уверенности
        rawData: result
      };
    } catch (error) {
      console.error('Seshat recognition error:', error);
      return {
        success: false,
        confidence: 0,
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
    // Это будет ограниченная реализация, пока текстовых символов
    try {
      await this.initialize();
      
      if (!this.isInitialized || !this.seshatInstance) {
        throw new Error('Seshat is not initialized');
      }
      
      // Преобразуем входные данные
      const processedImage = await this.preprocessImage(imageData);
      
      // Вызываем функцию распознавания символов
      const result = this.seshatInstance.recognizeText(processedImage);
      
      if (!result || !result.text) {
        return {
          success: false,
          confidence: 0,
          error: 'Failed to recognize text'
        };
      }
      
      return {
        success: true,
        text: result.text,
        confidence: result.confidence || 0.5,
        rawData: result
      };
    } catch (error) {
      console.error('Seshat text recognition error:', error);
      return {
        success: false,
        confidence: 0,
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