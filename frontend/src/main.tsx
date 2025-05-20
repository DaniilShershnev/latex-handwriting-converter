import React from 'react'
import ReactDOM from 'react-dom/client'

// Простое приложение для демонстрации
const App = () => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1>Рукописный конвертер в LaTeX</h1>
      <p>Демонстрационная версия приложения</p>
      <div style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        Здесь будет область для рисования формул
      </div>
    </div>
  )
}

// Рендерим приложение
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)