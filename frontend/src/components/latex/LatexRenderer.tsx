import React, { useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Определяем свойства для типов MathJax и window с MathJax
declare global {
  interface Window {
    MathJax: any;
  }
}

interface LatexRendererProps {
  /**
   * LaTeX-код для рендеринга
   */
  latex: string;
  
  /**
   * CSS-класс для контейнера
   */
  className?: string;
  
  /**
   * Обработчик события готовности рендеринга
   */
  onRenderComplete?: () => void;
}

/**
 * Компонент для рендеринга LaTeX с использованием MathJax
 */
const LatexRenderer: React.FC<LatexRendererProps> = ({
  latex,
  className = '',
  onRenderComplete
}) => {
  // Ссылка на контейнер с LaTeX
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Рендерим LaTeX при изменении входных данных
  useEffect(() => {
    if (!containerRef.current || !latex) return;
    
    // Устанавливаем содержимое контейнера
    containerRef.current.innerHTML = `$$${latex}$$`;
    
    // Инициализируем MathJax для рендеринга LaTeX, если он доступен
    if (window.MathJax) {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, containerRef.current]);
      
      // Уведомляем о завершении рендеринга
      window.MathJax.Hub.Queue(() => {
        if (onRenderComplete) {
          onRenderComplete();
        }
      });
    } else {
      console.warn('MathJax is not available. LaTeX rendering might not work properly.');
    }
  }, [latex, onRenderComplete]);
  
  return (
    <div 
      ref={containerRef} 
      className={`latex-renderer ${className}`}
    />
  );
};

interface LatexDocumentProps {
  /**
   * Название документа
   */
  title: string;
  
  /**
   * Содержимое документа (массив элементов LaTeX или текста)
   */
  content: Array<{
    id: string;
    type: 'text' | 'math';
    content: string;
  }>;
  
  /**
   * CSS-класс для контейнера
   */
  className?: string;
  
  /**
   * Выбранный шаблон оформления
   */
  template?: 'classic' | 'modern' | 'minimal';
}

/**
 * Компонент документа с LaTeX
 */
const LatexDocument: React.FC<LatexDocumentProps> = ({
  title,
  content,
  className = '',
  template = 'classic'
}) => {
  // Ссылка на контейнер документа
  const documentRef = useRef<HTMLDivElement>(null);
  
  // Функция для экспорта в PDF
  const exportToPDF = async () => {
    if (!documentRef.current) return;
    
    try {
      // Создаем новый PDF-документ
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Добавляем заголовок
      pdf.setFontSize(18);
      pdf.text(title, 105, 20, { align: 'center' });
      
      // Подготавливаем содержимое
      let yPosition = 30;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      
      // Добавляем каждый элемент контента
      for (const item of content) {
        if (item.type === 'text') {
          // Добавляем текстовый элемент
          pdf.setFontSize(12);
          const textLines = pdf.splitTextToSize(item.content, contentWidth);
          
          // Проверяем, необходима ли новая страница
          if (yPosition + textLines.length * 7 > pdf.internal.pageSize.height - margin) {
            pdf.addPage();
            yPosition = 20;
          }
          
          // Добавляем текст
          pdf.text(textLines, margin, yPosition);
          yPosition += textLines.length * 7 + 5;
        } else if (item.type === 'math') {
          // Для математических формул мы можем сделать следующее:
          // 1. Создать временный HTML-элемент с формулой и отрендерить его с MathJax
          // 2. Сделать скриншот с помощью html2canvas
          // 3. Добавить изображение в PDF
          
          // Это упрощенная версия, которая просто добавляет LaTeX-код в PDF:
          pdf.setFontSize(10);
          pdf.text(`LaTeX: ${item.content}`, margin, yPosition);
          yPosition += 10;
          
          // В реальной реализации здесь должна быть логика для рендеринга формулы в PDF
          // Это требует более сложного подхода с использованием html2canvas или других библиотек
        }
      }
      
      // Сохраняем PDF
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ошибка при создании PDF. Пожалуйста, попробуйте еще раз.');
    }
  };
  
  // Применяем разные стили в зависимости от выбранного шаблона
  let templateClass = '';
  switch (template) {
    case 'modern':
      templateClass = 'latex-template-modern';
      break;
    case 'minimal':
      templateClass = 'latex-template-minimal';
      break;
    default:
      templateClass = 'latex-template-classic';
  }
  
  return (
    <div className={`latex-document ${templateClass} ${className}`}>
      <div className="document-header">
        <h1 className="document-title">{title}</h1>
      </div>
      
      <div className="document-content" ref={documentRef}>
        {content.map(item => (
          <div key={item.id} className={`content-item content-${item.type}`}>
            {item.type === 'text' ? (
              <div className="text-content">{item.content}</div>
            ) : (
              <LatexRenderer latex={item.content} />
            )}
          </div>
        ))}
      </div>
      
      <div className="document-actions">
        <button className="export-button" onClick={exportToPDF}>
          Экспорт в PDF
        </button>
      </div>
    </div>
  );
};

export { LatexRenderer, LatexDocument };