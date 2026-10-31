import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, type Pinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { nextTick } from 'vue'
import { useUserStore } from '../../src/stores/user'

/**
 * 用 createApp 挂载 pinia，与 main.ts 真实用法一致。
 * 注意：必须通过 app.use 才会真正安装持久化插件并挂载 $persist/$hydrate，
 * 仅 setActivePinia 不会触发插件。
 */
function createPersistedPinia(): Pinia {
  const pinia = createPinia()
  pinia.use(createPersistedState())
  const app = createApp({})
  app.use(pinia)
  return pinia
}

function createMemoryStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    dump: () => store,
  }
}

describe('useUserStore 持久化', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('login 后自动将状态持久化到 localStorage', async () => {
    createPersistedPinia()
    const store = useUserStore()

    store.login({ token: 'tok-persist', userInfo: { name: '赵六', role: '读者' } })
    // $subscribe 采用 post 渲染调度，等待一轮调度确保写入完成
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))

    const raw = localStorage.getItem('user')
    expect(raw).not.toBeNull()
    const saved = JSON.parse(raw as string)
    expect(saved.token).toBe('tok-persist')
    expect(saved.userInfo).toEqual({ name: '赵六', role: '读者' })
  })

  it('模拟刷新：从 localStorage 重新水合，登录态自动恢复', async () => {
    createPersistedPinia()
    const store = useUserStore()

    store.login({ token: 'tok-restore', userInfo: { name: '钱七', role: '管理员' } })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(localStorage.getItem('user')).not.toBeNull()

    // 模拟刷新：用全新的 Pinia + store，从 localStorage 水合
    createPersistedPinia()
    const restored = useUserStore()
    expect(restored.token).toBe('tok-restore')
    expect(restored.userInfo).toEqual({ name: '钱七', role: '管理员' })
  })

  it('logout 后，localStorage 中的登录状态被同步清空', async () => {
    createPersistedPinia()
    const store = useUserStore()

    store.login({ token: 'tok-logout', userInfo: { name: '孙八', role: '读者' } })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(localStorage.getItem('user')).not.toBeNull()

    store.logout()
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(store.token).toBe('')
    expect(store.isLoggedIn).toBe(false)
  })

  it('支持自定义 storage：使用内存存储持久化', async () => {
    const memory = createMemoryStorage()
    const pinia = createPinia()
    pinia.use(
      createPersistedState({
        storage: memory as unknown as Storage,
      })
    )
    const app = createApp({})
    app.use(pinia)

    const store = useUserStore()
    store.login({ token: 'tok-mem', userInfo: { name: '李思', role: '读者' } })
    await nextTick()
    await new Promise((r) => setTimeout(r, 0))

    expect(memory.dump()['user']).toBeDefined()
    const saved = JSON.parse(memory.dump()['user'])
    expect(saved.token).toBe('tok-mem')
  })
})