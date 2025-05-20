/**
 * Хук для работы с распознаванием рукописного ввода
 */
import { useState, useCallback, useEffect } from 'react';
import recognitionApiService, { ProviderInfo } from '@/services/recognitionApiService';
import { RecognitionResult } from '@/modules/recognition/types';

export interface UseRecognitionOptions {
  /**
   * ID провайдера по умолчанию
   */
  defaultProviderId?: string;
  
  /**
   * Обработчик успешного распознавания
   */
  onSuccess?: (result: RecognitionResult) => void;
  
  /**
   * Обработчик ошибки распознавания
   */
  onError?: (error: string) => void;
}

/**
 * Хук для работы с распознаванием рукописного ввода
 */
export function useRecognition(options: UseRecognitionOptions = {}) {
  // Состояние для результата распознавания
  const [result, setResult] = useState<RecognitionResult | null>(null);
  
  // Состояние загрузки
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Состояние ошибки
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для провайдеров
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  
  // Состояние для выбранного провайдера
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(
    options.defaultProviderId
  );
  
  // Загрузка провайдеров при инициализации
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providersList = await recognitionApiService.getProviders();
        setProviders(providersList);
        
        // Если нет выбранного провайдера и есть доступные провайдеры, выбираем первый
        if (!selectedProviderId && providersList.length > 0) {
          // Приоритет отдаем доступным провайдерам
          const availableProviders = providersList.filter(p => p.isAvailable);
          
          if (availableProviders.length > 0) {
            setSelectedProviderId(availableProviders[0].id);
          } else if (providersList.length > 0) {
            setSelectedProviderId(providersList[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
        setError('Failed to load recognition providers');
      }
    };
    
    fetchProviders();
  }, [options.defaultProviderId]);
  
  /**
   * Распознает математическую формулу из изображения
   */
  const recognizeMath = useCallback(
    async (imageData: string | Blob): Promise<RecognitionResult> => {
      try {
        setIsLoading(true);
        setError(null);
        
        const recognitionResult = await recognitionApiService.recognizeMath({
          image: imageData,
          providerId: selectedProviderId
        });
        
        setResult(recognitionResult);
        
        if (recognitionResult.success) {
          options.onSuccess?.(recognitionResult);
        } else {
          const errorMessage = recognitionResult.error || 'Recognition failed';
          setError(errorMessage);
          options.onError?.(errorMessage);
        }
        
        return recognitionResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        options.onError?.(errorMessage);
        
        const failResult: RecognitionResult = {
          success: false,
          confidence: 0,
          error: errorMessage
        };
        setResult(failResult);
        
        return failResult;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedProviderId, options.onSuccess, options.onError]
  );
  
  /**
   * Распознает текст из изображения
   */
  const recognizeText = useCallback(
    async (imageData: string | Blob): Promise<RecognitionResult> => {
      try {
        setIsLoading(true);
        setError(null);
        
        const recognitionResult = await recognitionApiService.recognizeText({
          image: imageData,
          providerId: selectedProviderId
        });
        
        setResult(recognitionResult);
        
        if (recognitionResult.success) {
          options.onSuccess?.(recognitionResult);
        } else {
          const errorMessage = recognitionResult.error || 'Recognition failed';
          setError(errorMessage);
          options.onError?.(errorMessage);
        }
        
        return recognitionResult;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        options.onError?.(errorMessage);
        
        const failResult: RecognitionResult = {
          success: false,
          confidence: 0,
          error: errorMessage
        };
        setResult(failResult);
        
        return failResult;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedProviderId, options.onSuccess, options.onError]
  );
  
  /**
   * Изменяет выбранный провайдер
   */
  const changeProvider = useCallback((providerId: string) => {
    setSelectedProviderId(providerId);
  }, []);
  
  /**
   * Сбрасывает состояние
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  
  return {
    recognizeMath,
    recognizeText,
    result,
    isLoading,
    error,
    providers,
    selectedProviderId,
    changeProvider,
    reset
  };
}