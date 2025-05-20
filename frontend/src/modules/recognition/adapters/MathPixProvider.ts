import { RecognitionProvider, RecognitionResult, RecognitionCapabilities } from '../interfaces';

/**
 * Конфигурация для MathPix провайдера
 */
export interface MathPixProviderConfig {
  /**
   * ID приложения MathPix
   */
  appId?: string;
  
  /**
   * API-ключ MathPix
   */
  apiKey?: string;
  
  /**
   * Опции распознавания
   */
  options?: {
    /**
     * Включает распознавание диаграмм
     */
    enableDiagrams?: boolean;
    
    /**
     * Включает распознавание таблиц
     */
    enableTables?: boolean;
    
    /**
     * Формат результатов (mathml, latex, text и т.д.)
     */
    formats?: string[];
  };
}

/**
 * Провайдер распознавания на основе MathPix API
 * https://mathpix.com/docs/api
 */
export class MathPixProvider implements RecognitionProvider {
  public readonly id = 'mathpix';
  public readonly name = 'MathPix API';
  public readonly requiresCredentials = true;
  
  private appId: string | null = null;
  private apiKey: string | null = null;
  private options: MathPixProviderConfig['options'] = {
    enableDiagrams: true,
    enableTables: true,
    formats: ['latex', 'text', 'mathml']
  };
  
  private baseUrl = 'https://api.mathpix.com/v3';
  
  constructor(config?: MathPixProviderConfig) {
    if (config) {
      this.appId = config.appId || null;
      this.apiKey = config.apiKey || null;
      this.options = { ...this.options, ...config.options };
    }
  }
  
  /**
   * Устанавливает учетные данные для доступа к API
   */
  public setCredentials(credentials: Record<string, string>): void {
    if (credentials.appId) {
      this.appId = credentials.appId;
    }
    
    if (credentials.apiKey) {
      this.apiKey = credentials.apiKey;
    }
  }
  
  /**
   * Проверяет, доступен ли провайдер (имеет ли все необходимые учетные данные)
   */
  public async isAvailable(): Promise<boolean> {
    return !!(this.appId && this.apiKey);
  }
  
  /**
   * Распознает математические формулы из изображения
   */
  public async recognizeMath(imageData: string | Blob): Promise<RecognitionResult> {
    try {
      if (!this.appId || !this.apiKey) {
        throw new Error('MathPix credentials are not set');
      }
      
      // Подготавливаем изображение
      const base64Image = await this.convertToBase64(imageData);
      
      // Выполняем запрос к API
      const response = await fetch(`${this.baseUrl}/ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'app_id': this.appId,
          'app_key': this.apiKey
        },
        body: JSON.stringify({
          src: base64Image,
          formats: this.options.formats,
          data_options: {
            include_asciimath: true,
            include_latex: true
          }
        })
      });
      
      // Проверяем ответ
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`MathPix API error: ${JSON.stringify(errorData)}`);
      }
      
      // Обрабатываем результат
      const result = await response.json();
      
      if (!result || (!result.latex && !result.text)) {
        return {
          success: false,
          confidence: 0,
          error: 'No valid result returned from MathPix'
        };
      }
      
      // Возвращаем результат распознавания
      return {
        success: true,
        latex: result.latex || null,
        text: result.text || null,
        confidence: result.confidence || 0.9, // MathPix обычно не указывает confidence
        rawData: result
      };
    } catch (error) {
      console.error('MathPix recognition error:', error);
      return {
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Распознает текст из изображения
   */
  public async recognizeText(imageData: string | Blob): Promise<RecognitionResult> {
    try {
      if (!this.appId || !this.apiKey) {
        throw new Error('MathPix credentials are not set');
      }
      
      // Подготавливаем изображение
      const base64Image = await this.convertToBase64(imageData);
      
      // Выполняем запрос к API с настройками для текстового режима
      const response = await fetch(`${this.baseUrl}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'app_id': this.appId,
          'app_key': this.apiKey
        },
        body: JSON.stringify({
          src: base64Image,
          formats: ['text'],
          data_options: {
            include_math: false,
          }
        })
      });
      
      // Проверяем ответ
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`MathPix API error: ${JSON.stringify(errorData)}`);
      }
      
      // Обрабатываем результат
      const result = await response.json();
      
      if (!result || !result.text) {
        return {
          success: false,
          confidence: 0,
          error: 'No valid text result returned from MathPix'
        };
      }
      
      // Возвращаем результат распознавания
      return {
        success: true,
        text: result.text,
        confidence: result.confidence || 0.9,
        rawData: result
      };
    } catch (error) {
      console.error('MathPix text recognition error:', error);
      return {
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Возвращает информацию о возможностях провайдера
   */
  public getCapabilities(): RecognitionCapabilities {
    return {
      supportsMathRecognition: true,
      supportsTextRecognition: true,
      supportsDiagramRecognition: this.options.enableDiagrams || false,
      supportedImageFormats: ['image/png', 'image/jpeg'],
      maxImageSize: 20 * 1024 * 1024, // 20MB
      usageLimits: {
        maxRequestsPerDay: 1000 // Примерное ограничение, зависит от плана подписки
      }
    };
  }
  
  /**
   * Преобразует различные типы входных данных в формат base64
   */
  private async convertToBase64(imageData: string | Blob): Promise<string> {
    // Если уже в формате base64
    if (typeof imageData === 'string') {
      // Для Data URLs просто возвращаем часть после base64,
      if (imageData.startsWith('data:')) {
        return imageData;
      }
      
      // Предполагаем, что это уже base64
      return `data:image/png;base64,${imageData}`;
    }
    
    // Преобразуем Blob в base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageData);
    });
  }
}