import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
// 引入插件类型增强，使 options store 的 persist 选项被 TypeScript 认可
import 'pinia-plugin-persistedstate'
import { useUserStore } from '../../src/stores/user'

// user store 纯逻辑测试：不依赖 DOM / 组件，直接通过 setActivePinia 在主进程测试
describe('useUserStore', () => {
  beforeEach(() => {
    // 每个用例都重建一个全新的 Pinia 实例，保证状态隔离
    setActivePinia(createPinia())
  })

  it('初始状态：未登录，token 为空，用户信息为空', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.userInfo).toEqual({ name: '', role: '' })
    expect(store.isLoggedIn).toBe(false)
    expect(store.username).toBe('')
  })

  it('isLoggedIn：仅当 token 非空时返回 true', () => {
    const store = useUserStore()
    expect(store.isLoggedIn).toBe(false)

    store.login({ token: 'abc', userInfo: { name: '张三', role: '读者' } })
    expect(store.isLoggedIn).toBe(true)
  })

  it('login：写入 token 与用户信息，username getter 同步返回', () => {
    const store = useUserStore()
    store.login({ token: 'tok-123', userInfo: { name: '李四', role: '管理员' } })

    expect(store.token).toBe('tok-123')
    expect(store.userInfo).toEqual({ name: '李四', role: '管理员' })
    expect(store.username).toBe('李四')
  })

  it('logout：清空 token 与用户信息，回到未登录态', () => {
    const store = useUserStore()
    store.login({ token: 'tok-456', userInfo: { name: '王五', role: '读者' } })
    expect(store.isLoggedIn).toBe(true)

    store.logout()

    expect(store.token).toBe('')
    expect(store.userInfo).toEqual({ name: '', role: '' })
    expect(store.isLoggedIn).toBe(false)
    expect(store.username).toBe('')
  })

  it('多次 login 覆盖旧状态', () => {
    const store = useUserStore()
    store.login({ token: 'tok-1', userInfo: { name: '甲', role: '读者' } })
    store.login({ token: 'tok-2', userInfo: { name: '乙', role: '管理员' } })

    expect(store.token).toBe('tok-2')
    expect(store.username).toBe('乙')
    expect(store.userInfo.role).toBe('管理员')
  })
})