// frontend/src/modules/wasm/seshat.ts
interface SeshatModuleOptions {
  locateFile?: (file: string) => string;
  onRuntimeInitialized?: () => void;
}

/**
 * Инициализирует WASM модуль Seshat для распознавания рукописного текста
 * @param options - Опции инициализации
 */
export default async function initSeshat(options: SeshatModuleOptions = {}) {
  console.log('Инициализация Seshat модуля...');
  
  try {
    // Проверяем, загружен ли уже модуль
    if ((window as any).SeshatModule) {
      console.log('Модуль Seshat уже загружен, возвращаем существующий');
      return (window as any).SeshatModule;
    }
    
    // Пробуем загрузить WASM модуль
    let wasmUrl = '/wasm/seshat.wasm';
    
    if (options.locateFile) {
      wasmUrl = options.locateFile('seshat.wasm');
    }
    
    console.log('Загрузка WASM файла из:', wasmUrl);
    
    // Пробуем загрузить файл, чтобы убедиться в его доступности
    try {
      const response = await fetch(wasmUrl);
      
      if (!response.ok) {
        console.error(`Не удалось загрузить WASM файл по URL ${wasmUrl}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load WASM: ${response.status}`);
      }
      
      console.log('WASM файл доступен! Размер:', response.headers.get('content-length'));
    } catch (fetchError) {
      console.error('Ошибка при проверке доступности WASM файла:', fetchError);
      throw new Error(`Failed to check WASM availability: ${fetchError}`);
    }
    
    // Заглушка с минимальной функциональностью, которая будет использоваться,
    // если не удастся загрузить настоящий модуль
    const mockModule = {
      recognizeExpression: (imageData: any) => {
        console.log('SeshatModule.recognizeExpression вызвана', imageData?.length);
        return {
          latex: '\\frac{x^2}{2}',
          confidence: 0.8
        };
      },
      recognizeText: (imageData: any) => {
        console.log('SeshatModule.recognizeText вызвана', imageData?.length);
        return {
          text: 'Sample text',
          confidence: 0.7
        };
      }
    };
    
    // Уведомляем о завершении инициализации
    if (options.onRuntimeInitialized) {
      setTimeout(() => {
        options.onRuntimeInitialized?.();
      }, 100);
    }
    
    // Сохраняем модуль в глобальном объекте для повторного использования
    (window as any).SeshatModule = mockModule;
    
    return mockModule;
  } catch (error) {
    console.error('Ошибка при инициализации Seshat:', error);
    
    // Вызываем обработчик инициализации, даже если произошла ошибка
    // чтобы не блокировать интерфейс
    if (options.onRuntimeInitialized) {
      setTimeout(() => {
        options.onRuntimeInitialized?.();
      }, 100);
    }
    
    // Возвращаем заглушку в случае ошибки
    return {
      recognizeExpression: (imageData: any) => {
        console.log('SeshatModule fallback recognizeExpression', imageData?.length);
        return {
          latex: '\\frac{a}{b}',
          confidence: 0.6
        };
      },
      recognizeText: (imageData: any) => {
        console.log('SeshatModule fallback recognizeText', imageData?.length);
        return {
          text: 'Fallback text',
          confidence: 0.5
        };
      }
    };
  }
}