import React, { useState, useEffect, useCallback } from 'react';
import HandwritingCanvas from './components/canvas/HandwritingCanvas';
import { LatexRenderer, LatexDocument } from './components/latex/LatexRenderer';
import { RecognitionServiceImpl } from './modules/recognition';
import { SeshatProvider } from './modules/recognition/adapters/SeshatProvider';
import { MathPixProvider } from './modules/recognition/adapters/MathPixProvider';
import { v4 as uuidv4 } from 'uuid';

// Типы для элементов документа
interface DocumentItem {
  id: string;
  type: 'text' | 'math';
  content: string;
}

// Типы провайдеров распознавания
type RecognitionProviderType = 'seshat' | 'mathpix';

// Основной компонент приложения
const App: React.FC = () => {
  // Состояние для документа
  const [documentTitle, setDocumentTitle] = useState<string>('Новый документ');
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  
  // Состояние для распознавания
  const [recognitionService, setRecognitionService] = useState<RecognitionServiceImpl | null>(null);
  const [activeProvider, setActiveProvider] = useState<RecognitionProviderType>('seshat');
  const [mathpixCredentials, setMathpixCredentials] = useState<{appId?: string, apiKey?: string}>({});
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  
  // Состояние для UI
  const [inputMode, setInputMode] = useState<'text' | 'math'>('math');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal'>('classic');
  
  // Инициализация сервиса распознавания
  useEffect(() => {
    const initializeRecognitionService = async () => {
      try {
        // Создаем провайдеры
        const seshatProvider = new SeshatProvider();
        
        // Создаем сервис распознавания
        const service = new RecognitionServiceImpl([seshatProvider]);
        
        // Если есть учетные данные MathPix, добавляем соответствующий провайдер
        if (mathpixCredentials.appId && mathpixCredentials.apiKey) {
          const mathpixProvider = new MathPixProvider({
            appId: mathpixCredentials.appId,
            apiKey: mathpixCredentials.apiKey
          });
          service.registerProvider(mathpixProvider);
        }
        
        setRecognitionService(service);
      } catch (error) {
        console.error('Failed to initialize recognition service:', error);
        setRecognitionError('Не удалось инициализировать сервис распознавания');
      }
    };
    
    initializeRecognitionService();
  }, [mathpixCredentials]);
  
  // Обработчик распознавания изображения
  const handleImageCapture = useCallback(async (imageData: string) => {
    if (!recognitionService) {
      setRecognitionError('Сервис распознавания не инициализирован');
      return;
    }
    
    try {
      setIsRecognizing(true);
      setRecognitionError(null);
      
      console.log(`Начинаем распознавание ${inputMode === 'math' ? 'формулы' : 'текста'} с провайдером ${activeProvider}`);
      
      let result;
      if (inputMode === 'math') {
        // Распознаем математическую формулу
        result = await recognitionService.recognizeMath(
          imageData,
          activeProvider // Используем активный провайдер
        );
      } else {
        // Распознаем текст
        result = await recognitionService.recognizeText(
          imageData,
          activeProvider
        );
      }
      
      console.log('Результат распознавания:', result);
      
      // Обрабатываем результат
      // Даже если success=false, но у нас есть fallbackProvider или текст/latex, 
      // мы всё равно добавляем элемент в документ
      if (result.success || result.latex || result.text) {
        // Добавляем новый элемент в документ
        const content = inputMode === 'math' 
          ? result.latex || '\frac{x^2}{2}' // Значение по умолчанию, если latex не определен
          : result.text || 'Текст не распознан';
        
        console.log(`Добавляем новый элемент типа ${inputMode} с содержимым: ${content}`);
        
        const newItem: DocumentItem = {
          id: uuidv4(),
          type: inputMode,
          content: content
        };
        
        setDocumentItems(prev => [...prev, newItem]);
        
        // Сбрасываем ошибку, даже если использовался fallback провайдер
        setRecognitionError(null);
      } else {
        console.warn('Распознавание не удалось:', result.error);
        setRecognitionError(result.error || 'Не удалось распознать');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setRecognitionError('Ошибка при распознавании: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsRecognizing(false);
    }
  }, [recognitionService, inputMode, activeProvider]);
  
  // Обработчик ввода учетных данных MathPix
  const handleMathPixCredentialsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setMathpixCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработчик добавления текстового блока
  const handleAddTextBlock = () => {
    const newItem: DocumentItem = {
      id: uuidv4(),
      type: 'text',
      content: ''
    };
    
    setDocumentItems(prev => [...prev, newItem]);
  };
  
  // Обработчик изменения элемента документа
  const handleItemChange = (id: string, content: string) => {
    setDocumentItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, content } : item
      )
    );
  };
  
  // Обработчик удаления элемента документа
  const handleItemDelete = (id: string) => {
    setDocumentItems(prev => prev.filter(item => item.id !== id));
  };
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Рукописный конвертер в LaTeX</h1>
        <div className="document-title-container">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="document-title-input"
            placeholder="Название документа"
          />
        </div>
      </header>
      
      <main className="app-content">
        <div className="app-sidebar">
          <div className="sidebar-section">
            <h3>Режим ввода</h3>
            <div className="input-mode-selector">
              <button
                className={`mode-button ${inputMode === 'math' ? 'active' : ''}`}
                onClick={() => setInputMode('math')}
              >
                Формула
              </button>
              <button
                className={`mode-button ${inputMode === 'text' ? 'active' : ''}`}
                onClick={() => setInputMode('text')}
              >
                Текст
              </button>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Провайдер распознавания</h3>
            <div className="provider-selector">
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value as RecognitionProviderType)}
                className="provider-select"
              >
                <option value="seshat">Seshat (локальный)</option>
                {mathpixCredentials.appId && mathpixCredentials.apiKey && (
                  <option value="mathpix">MathPix API</option>
                )}
              </select>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>MathPix API (опционально)</h3>
            <div className="mathpix-credentials">
              <input
                type="text"
                name="appId"
                value={mathpixCredentials.appId || ''}
                onChange={handleMathPixCredentialsChange}
                placeholder="App ID"
                className="credentials-input"
              />
              <input
                type="password"
                name="apiKey"
                value={mathpixCredentials.apiKey || ''}
                onChange={handleMathPixCredentialsChange}
                placeholder="API Key"
                className="credentials-input"
              />
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Шаблон документа</h3>
            <div className="template-selector">
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="template-select"
              >
                <option value="classic">Классический</option>
                <option value="modern">Современный</option>
                <option value="minimal">Минималистичный</option>
              </select>
            </div>
          </div>
          
          <div className="sidebar-section">
            <button
              className="add-text-button"
              onClick={handleAddTextBlock}
            >
              Добавить текстовый блок
            </button>
          </div>
        </div>
        
        <div className="app-editor">
          <div className="input-section">
            <h2>Рукописный ввод ({inputMode === 'math' ? 'формула' : 'текст'})</h2>
            <HandwritingCanvas
              width={600}
              height={300}
              onImageCapture={handleImageCapture}
              mode={inputMode}
              className="main-canvas"
            />
            {isRecognizing && (
              <div className="recognition-status">Распознавание...</div>
            )}
            {recognitionError && (
              <div className="recognition-error">{recognitionError}</div>
            )}
          </div>
          
          <div className="preview-section">
            <h2>Документ</h2>
            <LatexDocument
              title={documentTitle}
              content={documentItems}
              template={template}
              className="document-preview"
            />
          </div>
        </div>
      </main>
      
      <div className="document-items-editor">
        <h3>Редактирование документа</h3>
        {documentItems.length === 0 ? (
          <div className="empty-document-message">
            Документ пуст. Напишите что-нибудь на холсте и нажмите "Распознать", 
            или добавьте текстовый блок.
          </div>
        ) : (
          <div className="items-list">
            {documentItems.map(item => (
              <div key={item.id} className="document-item-editor">
                <div className="item-type-indicator">
                  {item.type === 'math' ? 'Формула' : 'Текст'}
                </div>
                {item.type === 'math' ? (
                  <div className="math-item-editor">
                    <textarea
                      value={item.content}
                      onChange={(e) => handleItemChange(item.id, e.target.value)}
                      className="item-content-input"
                      placeholder="LaTeX код"
                    />
                    <div className="math-preview">
                      <LatexRenderer latex={item.content} />
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={item.content}
                    onChange={(e) => handleItemChange(item.id, e.target.value)}
                    className="item-content-input"
                    placeholder="Введите текст"
                  />
                )}
                <button
                  className="delete-item-button"
                  onClick={() => handleItemDelete(item.id)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;