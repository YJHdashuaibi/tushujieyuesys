import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { config } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { setupServer } from 'msw/node'
// handlers 为 JS 模块，无类型声明
// @ts-expect-error - 纯 JS mock 数据，无 d.ts
import { handlers } from '../src/mock/handlers'

// 1) 挂载 Element Plus：让所有 mount 出来的组件默认带上 Element Plus 插件
config.global.plugins = [ElementPlus]

// 2) 开启 MSW 服务：复用项目里的内存 mock 接口
export const server = setupServer(...handlers)

// 每个测试文件启动前开启 MSW
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

// 每个用例结束后：
// - 复位 MSW 请求处理器（避免用例间互相污染）
// - 清理 localStorage / sessionStorage
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  sessionStorage.clear()
})

// 所有用例结束后关闭 MSW
afterAll(() => server.close())

// 3) 清理 localStorage：每次用例前也确保空状态，避免 Pinia 持久化残留
beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.clearAllMocks()
})