/**
 * Сервис для работы с API распознавания
 */
import { RecognitionResult } from '@/modules/recognition/types';

/**
 * Базовые конфигурации для API
 */
const API_BASE_URL = '/api';
/**
 * Интерфейс для провайдера распознавания
 */
export interface ProviderInfo {
  id: string;
  name: string;
  requiresCredentials: boolean;
  isAvailable: boolean;
  capabilities: {
    supportsMathRecognition: boolean;
    supportsTextRecognition: boolean;
    supportsDiagramRecognition: boolean;
    supportedImageFormats: string[];
    maxImageSize?: number;
    usageLimits?: {
      maxRequestsPerDay?: number;
      maxRequestsPerHour?: number;
    };
  };
}

/**
 * Параметры запроса распознавания
 */
export interface RecognitionRequest {
  /**
   * Изображение в формате base64 или Blob
   */
  image: string | Blob;
  
  /**
   * ID провайдера для распознавания (опционально)
   */
  providerId?: string;
}

/**
 * Сервис для работы с API распознавания
 */
class RecognitionApiService {
  /**
   * Базовый URL для API
   */
  private baseUrl: string;
  
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Получает список доступных провайдеров
   */
  public async getProviders(): Promise<ProviderInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recognition/providers`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch providers');
      }
      
      return data.providers;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }
  
  /**
   * Распознает математические формулы из изображения
   */
  public async recognizeMath(request: RecognitionRequest): Promise<RecognitionResult> {
    try {
      const formData = new FormData();
      
      // Добавляем изображение
      if (typeof request.image === 'string') {
        // Если изображение в формате base64
        formData.append('image', request.image);
      } else {
        // Если изображение в формате Blob
        formData.append('image', request.image);
      }
      
      // Добавляем providerId, если указан
      if (request.providerId) {
        formData.append('providerId', request.providerId);
      }
      
      // Отправляем запрос
      const response = await fetch(`${this.baseUrl}/recognition/math`, {
        method: 'POST',
        body: formData,
      });
      
      // Обрабатываем ответ
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Recognition failed with status: ${response.status}`
        );
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in recognizeMath:', error);
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
  public async recognizeText(request: RecognitionRequest): Promise<RecognitionResult> {
    try {
      const formData = new FormData();
      
      // Добавляем изображение
      if (typeof request.image === 'string') {
        // Если изображение в формате base64
        formData.append('image', request.image);
      } else {
        // Если изображение в формате Blob
        formData.append('image', request.image);
      }
      
      // Добавляем providerId, если указан
      if (request.providerId) {
        formData.append('providerId', request.providerId);
      }
      
      // Отправляем запрос
      const response = await fetch(`${this.baseUrl}/recognition/text`, {
        method: 'POST',
        body: formData,
      });
      
      // Обрабатываем ответ
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Recognition failed with status: ${response.status}`
        );
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in recognizeText:', error);
      return {
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const recognitionApiService = new RecognitionApiService();

export default recognitionApiService;