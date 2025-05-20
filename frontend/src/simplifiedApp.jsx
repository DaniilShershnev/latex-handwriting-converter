import React from 'react';

const SimplifiedApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-700 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">Рукописный конвертер в LaTeX</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
          <h2 className="text-xl font-semibold mb-4">Демо-версия приложения</h2>
          <p className="mb-4">
            Это упрощенная версия "Рукописного конвертера в LaTeX". 
            Полная функциональность в разработке.
          </p>
          <div className="border-2 border-dashed border-gray-300 p-4 mb-6 rounded-lg">
            <div className="text-center text-gray-500">
              Здесь будет область для рисования формул
            </div>
          </div>
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => alert('Демо-функция: \\frac{x^2}{2}')}
          >
            Симулировать распознавание
          </button>
        </div>
      </main>

      <footer className="bg-gray-100 py-4 text-center text-gray-600">
        <p>© 2025 Рукописный конвертер в LaTeX. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default SimplifiedApp;