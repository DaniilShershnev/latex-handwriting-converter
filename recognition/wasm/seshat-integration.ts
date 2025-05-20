/**
 * Интеграция с Seshat через WebAssembly
 */
import path from 'path';
import fs from 'fs';
import { RecognitionProvider, RecognitionResult, RecognitionCapabilities } from '../interfaces';

/**
 * Загрузка и настройка WebAssembly модуля для Seshat
 */
async function loadSeshatWasmModule() {
  try {
    // Путь к WASM файлу
    const wasmPath = path.resolve(__dirname, '../../../recognition/wasm/seshat.wasm');
    
    // Чтение бинарных данных
    const wasmBinary = fs.readFileSync(wasmPath);
    
    // Импортируем dynamic import для загрузки WebAssembly в Node.js
    // Примечание: в реальной реализации нужно использовать оптимизированный загрузчик WebAssembly
    const { default: initSeshat } = await import('seshat-wasm');
    
    // Инициализируем и возвращаем модуль
    const SeshatModule = await initSeshat(wasmBinary);
    
    return SeshatModule;
  } catch (error) {
    console.error('Failed to load Seshat WASM module:', error);
    throw error;
  }
}

/**
 * Серверная имплементация SeshatProvider с использованием WebAssembly
 */
export class SeshatProvider implements RecognitionProvider {
  public readonly id = 'seshat';
  public readonly name = 'Seshat (Open Source)';
  public readonly requiresCredentials = false;
  
  private seshatModule: any = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  
  constructor() {
    // Инициализируем Seshat при создании
    this.initialize();
  }
  
  /**
   * Инициализирует Seshat WASM модуль
   */
  private async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        this.seshatModule = await loadSeshatWasmModule();
        this.isInitialized = true;
        resolve();
      } catch (error) {
        console.error('Failed to initialize Seshat:', error);
        reject(error);
      }
    });
    
    return this.initPromise;
  }
  
  /**
   * Проверяет доступность Seshat
   */
  public async isAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      return this.isInitialized;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Распознает математические формулы из изображения
   */
  public async recognizeMath(imageData: Buffer | string): Promise<RecognitionResult> {
    try {
      await this.initialize();
      
      if (!this.isInitialized || !this.seshatModule) {
        throw new Error('Seshat is not initialized');
      }
      
      // Преобразуем входные данные в формат, понятный для Seshat
      const imageBuffer = await this.preprocessImage(imageData);
      
      // Вызываем функцию распознавания из WASM модуля
      const recognizer = new this.seshatModule.Recognizer();
      const result = recognizer.recognizeFormula(imageBuffer);
      
      // Проверяем результат
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
        confidence: result.confidence || 0.7,
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
   */
  public async recognizeText(imageData: Buffer | string): Promise<RecognitionResult> {
    try {
      await this.initialize();
      
      if (!this.isInitialized || !this.seshatModule) {
        throw new Error('Seshat is not initialized');
      }
      
      // Преобразуем входные данные
      const imageBuffer = await this.preprocessImage(imageData);
      
      // Вызываем функцию распознавания символов
      const recognizer = new this.seshatModule.Recognizer();
      const result = recognizer.recognizeText(imageBuffer);
      
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
   */
  private async preprocessImage(imageData: Buffer | string): Promise<Uint8Array> {
    // Преобразуем различные входные форматы в Uint8Array
    if (Buffer.isBuffer(imageData)) {
      return new Uint8Array(imageData);
    }
    
    // Обрабатываем base64 строку
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        // Извлекаем base64 из формата Data URL
        const base64 = imageData.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        return new Uint8Array(buffer);
      } else {
        // Обычная base64 строка
        const buffer = Buffer.from(imageData, 'base64');
        return new Uint8Array(buffer);
      }
    }
    
    throw new Error('Unsupported image data format');
  }
}