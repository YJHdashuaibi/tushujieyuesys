import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { setupWorker } from 'msw/browser'
import { handlers } from './mock/handlers'
import './style.css'
import App from './App.vue'
import router from './router'

// 仅当显式开启 VITE_USE_MOCK=true 时启动 MSW mock worker
async function prepare() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  const worker = setupWorker(...handlers)
  try {
    // 未 mock 的请求正常放行（bypass），避免对每个未模拟请求逐一打印警告
    await worker.start({ onUnhandledFrame: 'bypass' })
  } catch (e) {
    // mock 启动失败不阻塞应用，仅提示
    console.warn('[MSW] mock worker 启动失败，已切换到真实请求', e)
  }
}

// 启动入口：无论 MSW 是否就绪都挂载应用
prepare().then(() => {
  const app = createApp(App)

  const pinia = createPinia()
  pinia.use(createPersistedState())
  app.use(pinia)

  app.use(router)
  app.mount('#app')
}).catch((e) => {
  console.error('应用启动失败', e)
})