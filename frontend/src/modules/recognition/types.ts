// Базовые интерфейсы для модуля распознавания

/**
 * Результат распознавания
 */
export interface RecognitionResult {
  /**
   * Распознанный LaTeX код
   */
  latex?: string;
  
  /**
   * Распознанный текст (для нематематических элементов)
   */
  text?: string;
  
  /**
   * Информация о конфиденциальности результата
   */
  confidence: number;
  
  /**
   * Исходные данные от провайдера (для отладки)
   */
  rawData?: any;
  
  /**
   * Указывает, было ли распознавание успешным
   */
  success: boolean;
  
  /**
   * Сообщение об ошибке, если распознавание не удалось
   */
  error?: string;

  /**
   * Провайдер, использованный для фолбэка
   */
  fallbackProvider?: string;
}

/**
 * Возможности провайдера распознавания
 */
export interface RecognitionCapabilities {
  /**
   * Поддерживает ли провайдер распознавание текста
   */
  supportsTextRecognition: boolean;
  
  /**
   * Поддерживает ли провайдер распознавание математических формул
   */
  supportsMathRecognition: boolean;
  
  /**
   * Поддерживает ли провайдер распознавание диаграмм
   */
  supportsDiagramRecognition: boolean;
  
  /**
   * Поддерживаемые форматы изображений
   */
  supportedImageFormats: string[];
  
  /**
   * Максимальный размер изображения в байтах
   */
  maxImageSize?: number;
  
  /**
   * Ограничения на использование (например, запросы в день)
   */
  usageLimits?: {
    maxRequestsPerDay?: number;
    maxRequestsPerHour?: number;
  };
}

/**
 * Провайдер распознавания
 */
export interface RecognitionProvider {
  /**
   * Уникальный идентификатор провайдера
   */
  readonly id: string;
  
  /**
   * Человекочитаемое название провайдера
   */
  readonly name: string;
  
  /**
   * Указывает, требует ли провайдер API-ключ или другие учетные данные
   */
  readonly requiresCredentials: boolean;
  
  /**
   * Указывает, доступен ли провайдер для использования
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Устанавливает учетные данные, если они необходимы
   */
  setCredentials?(credentials: Record<string, string>): void;
  
  /**
   * Распознает математические выражения из изображения
   */
  recognizeMath(imageData: string | Blob): Promise<RecognitionResult>;
  
  /**
   * Распознает текст из изображения
   */
  recognizeText(imageData: string | Blob): Promise<RecognitionResult>;
  
  /**
   * Возвращает информацию о возможностях провайдера
   */
  getCapabilities(): RecognitionCapabilities;
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
  providerId?: string | undefined;
}