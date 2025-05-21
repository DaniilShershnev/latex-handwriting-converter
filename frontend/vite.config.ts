import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Проверка наличия файла WASM в директории public
const wasmPath = path.resolve(__dirname, 'public/wasm/seshat.wasm')
if (!fs.existsSync(wasmPath)) {
  console.warn('⚠️ WASM файл не найден в public/wasm! Копирование из frontend/public/wasm')
  
  // Проверяем наличие файла в другой директории
  const alternativePath = path.resolve(__dirname, 'frontend/public/wasm/seshat.wasm')
  if (fs.existsSync(alternativePath)) {
    // Создаем директорию, если она не существует
    if (!fs.existsSync(path.dirname(wasmPath))) {
      fs.mkdirSync(path.dirname(wasmPath), { recursive: true })
    }
    
    // Копируем файл
    fs.copyFileSync(alternativePath, wasmPath)
    console.log('✅ WASM файл успешно скопирован')
  } else {
    console.error('❌ Не удалось найти WASM файл и в альтернативной директории!')
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
    // Явно указываем, что нужно копировать wasm файлы
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Сохраняем структуру директорий для WASM файлов
          if (assetInfo.name.endsWith('.wasm')) {
            return 'assets/wasm/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    // Настройка для лучшей обработки WASM
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})