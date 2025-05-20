// Заглушка для API распознавания
window.mockRecognition = {
  math: function() {
    console.log('Использую mock API для распознавания формулы');
    return {
      success: true,
      latex: "\\frac{x^2}{2}",
      confidence: 0.9
    };
  },
  text: function() {
    console.log('Использую mock API для распознавания текста');
    return {
      success: true,
      text: "Распознанный текст",
      confidence: 0.8
    };
  }
};

// Добавляем глобальную функцию для обратного вызова
window.mockRecognitionCallback = null;

