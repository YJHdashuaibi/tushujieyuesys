/// <reference types="vitest/config" />
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [VueDevTools(), vue()],
  test: {
    environment: 'jsdom', // 在浏览器 DOM 环境中运行测试，模拟浏览器 API
    setupFiles: ['./tests/setup.ts'], // 挂载 Element Plus、清理 localStorage、开启 MSW
    globals: false, // 显式从 'vitest' 导入 describe/it/expect，而非全局
  },
})