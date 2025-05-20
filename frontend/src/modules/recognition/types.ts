/**
 * Интерфейс для всех провайдеров распознавания
 * Каждая система распознавания должна реализовать этот интерфейс
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
   * @param credentials - учетные данные для провайдера
   */
  setCredentials?(credentials: Record<string, string>): void;
  
  /**
   * Распознает математические выражения из изображения
   * @param imageData - данные изображения в формате base64 или Blob
   * @returns промис с результатом распознавания
   */
  recognizeMath(imageData: string | Blob): Promise<RecognitionResult>;
  
  /**
   * Распознает текст из изображения
   * @param imageData - данные изображения в формате base64 или Blob
   * @returns промис с результатом распознавания текста
   */
  recognizeText(imageData: string | Blob): Promise<RecognitionResult>;
  
  /**
   * Возвращает информацию о возможностях провайдера
   */
  getCapabilities(): RecognitionCapabilities;
}

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
 * Фабрика провайдеров распознавания
 */
export interface RecognitionProviderFactory {
  /**
   * Создает экземпляр провайдера распознавания
   * @param config - конфигурация для создания провайдера
   */
  createProvider(config?: Record<string, any>): Promise<RecognitionProvider>;
}

/**
 * Сервис распознавания, управляющий различными провайдерами
 */
export interface RecognitionService {
  /**
   * Регистрирует новый провайдер в сервисе
   * @param provider - провайдер для регистрации
   */
  registerProvider(provider: RecognitionProvider): void;
  
  /**
   * Удаляет провайдер из сервиса
   * @param providerId - идентификатор провайдера для удаления
   */
  unregisterProvider(providerId: string): void;
  
  /**
   * Получает провайдер по его идентификатору
   * @param providerId - идентификатор провайдера
   */
  getProvider(providerId: string): RecognitionProvider | undefined;
  
  /**
   * Получает список всех зарегистрированных провайдеров
   */
  getAllProviders(): RecognitionProvider[];
  
  /**
   * Распознает формулы, используя лучший доступный провайдер
   * или указанный провайдер, если providerId задан
   * @param imageData - данные изображения
   * @param providerId - опциональный идентификатор конкретного провайдера
   */
  recognizeMath(imageData: string | Blob, providerId?: string): Promise<RecognitionResult>;
  
  /**
   * Распознает текст, используя лучший доступный провайдер
   * или указанный провайдер, если providerId задан
   * @param imageData - данные изображения
   * @param providerId - опциональный идентификатор конкретного провайдера
   */
  recognizeText(imageData: string | Blob, providerId?: string): Promise<RecognitionResult>;
}

/**
 * Стратегия выбора провайдера
 */
export interface ProviderSelectionStrategy {
  /**
   * Выбирает наиболее подходящий провайдер для данной задачи
   * @param providers - список доступных провайдеров
   * @param recognitionType - тип распознавания (text, math, diagram)
   * @param imageData - опциональные данные изображения для анализа
   */
  selectProvider(
    providers: RecognitionProvider[],
    recognitionType: 'text' | 'math' | 'diagram',
    imageData?: string | Blob
  ): Promise<RecognitionProvider | undefined>;
}

/**
 * Стратегия резервного восстановления при ошибке распознавания
 */
export interface FallbackStrategy {
  /**
   * Обрабатывает ошибку распознавания и пытается применить другой провайдер
   * @param error - ошибка, возникшая при распознавании
   * @param failedProvider - провайдер, который не смог выполнить распознавание
   * @param allProviders - список всех доступных провайдеров
   * @param imageData - данные изображения
   * @param recognitionType - тип распознавания
   */
  handleFailure(
    error: Error | string,
    failedProvider: RecognitionProvider,
    allProviders: RecognitionProvider[],
    imageData: string | Blob,
    recognitionType: 'text' | 'math' | 'diagram'
  ): Promise<RecognitionResult>;
}