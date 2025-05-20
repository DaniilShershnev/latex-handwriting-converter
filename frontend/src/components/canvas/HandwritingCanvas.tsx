import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

interface HandwritingCanvasProps {
  /**
   * Ширина холста
   */
  width?: number;
  
  /**
   * Высота холста
   */
  height?: number;
  
  /**
   * Толщина линии кисти
   */
  brushWidth?: number;
  
  /**
   * Цвет кисти
   */
  brushColor?: string;
  
  /**
   * Обработчик события получения изображения
   */
  onImageCapture?: (imageData: string) => void;
  
  /**
   * Режим ввода (текст или формула)
   */
  mode?: 'text' | 'math';
  
  /**
   * Класс CSS для контейнера
   */
  className?: string;
}

// Обработчик для получения изображения с холста
const handleCapture = () => {
  if (fabricCanvasRef.current && isCanvasModified) {
    // Получаем изображение в формате Data URL
    try {
      const imageData = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
      });
      
      // Вызываем обработчик, если он предоставлен
      if (onImageCapture) {
        // Пробуем вызвать оригинальный обработчик
        try {
          onImageCapture(imageData);
        } catch (error) {
          console.error('Error in image capture handler:', error);
          // Если оригинальный обработчик не сработал, используем заглушку
          if (window.mockRecognition) {
            const mockResult = mode === 'math' 
              ? window.mockRecognition.math()
              : window.mockRecognition.text();
            
            // Если определена функция обратного вызова для заглушки, вызываем её
            if (typeof window.mockRecognitionCallback === 'function') {
              window.mockRecognitionCallback(mockResult);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error capturing canvas image:', error);
    }
  }
};

/**
 * Компонент для рукописного ввода с поддержкой стилуса
 */
const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  width = 800,
  height = 400,
  brushWidth = 3,
  brushColor = '#000000',
  onImageCapture,
  mode = 'math',
  className = '',
}) => {
  // Ref для канваса
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Ref для экземпляра Fabric.js
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  // Состояние для отслеживания, был ли холст изменен
  const [isCanvasModified, setIsCanvasModified] = useState(false);
  
  // Создаем и инициализируем холст Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Создаем экземпляр Fabric.js
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width,
      height,
    });
    
    // Настраиваем кисть
    const brush = fabricCanvas.freeDrawingBrush;
    brush.width = brushWidth;
    brush.color = brushColor;
    
    // Оптимизация для стилуса
    fabricCanvas.enablePointerEvents = true;
    
    // Слушатель изменений холста
    fabricCanvas.on('path:created', () => {
      setIsCanvasModified(true);
    });
    
    // Сохраняем ссылку на экземпляр Fabric.js
    fabricCanvasRef.current = fabricCanvas;
    
    // Очистка при размонтировании
    return () => {
      fabricCanvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);
  
  // Обновляем параметры кисти при изменении пропсов
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const brush = fabricCanvasRef.current.freeDrawingBrush;
      brush.width = brushWidth;
      brush.color = brushColor;
    }
  }, [brushWidth, brushColor]);
  
  // Обработчик для очистки холста
  const handleClear = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      setIsCanvasModified(false);
    }
  };
  
  // Обработчик для получения изображения с холста
  const handleCapture = () => {
    if (fabricCanvasRef.current && isCanvasModified) {
      // Получаем изображение в формате Data URL
      const imageData = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
      });
      
      // Вызываем обработчик, если он предоставлен
      if (onImageCapture) {
        onImageCapture(imageData);
      }
    }
  };
  
  // Обработчик для отмены последнего действия (undo)
  const handleUndo = () => {
    if (fabricCanvasRef.current) {
      // Получаем объекты на холсте
      const objects = fabricCanvasRef.current.getObjects();
      
      if (objects.length > 0) {
        // Удаляем последний объект
        const lastObject = objects[objects.length - 1];
        fabricCanvasRef.current.remove(lastObject);
        fabricCanvasRef.current.renderAll();
        
        // Обновляем состояние модификации
        setIsCanvasModified(objects.length > 1);
      }
    }
  };
  
  return (
    <div className={`handwriting-canvas-container ${className}`}>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
      
      <div className="canvas-controls">
        <button
          className="control-button undo-button"
          onClick={handleUndo}
          disabled={!isCanvasModified}
        >
          Отмена
        </button>
        
        <button
          className="control-button clear-button"
          onClick={handleClear}
          disabled={!isCanvasModified}
        >
          Очистить
        </button>
        
        <button
          className="control-button capture-button primary"
          onClick={handleCapture}
          disabled={!isCanvasModified}
        >
          {mode === 'math' ? 'Распознать формулу' : 'Распознать текст'}
        </button>
      </div>
    </div>
  );
};

export default HandwritingCanvas;