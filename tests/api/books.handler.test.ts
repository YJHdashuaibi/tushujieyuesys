import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { useUserStore } from '../../src/stores/user'
// @ts-expect-error - 纯 JS api 模块
import { login } from '../../src/api/auth'
// @ts-expect-error - 纯 JS api 模块
import { fetchProtected } from '../../src/api/book'
// @ts-expect-error - 纯 JS request 实例
import request from '../../src/utils/request'

// setup.ts 已在全局启动 MSW server（msw/node），可直接用 fetch 调用 mock 接口。
// 使用绝对 URL，MSW node 端会按 path 匹配 handler 并返回 mock 数据。

// MSW 相对路径 handler（如 /api/books）在 jsdom 环境会基于 location.origin（默认 http://localhost:3000）
// 归一化为绝对 URL 匹配。此处基准 origin 必须与 jsdom location.origin 一致，否则 host/port 不匹配导致 handler 不被命中。
const ORIGIN = 'http://localhost:3000'

/** 发起 JSON 请求的辅助函数 */
async function doFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${ORIGIN}${path}`, init)
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

describe('图书相关 MSW 接口', () => {
  describe('GET /api/books', () => {
    it('不传参数时返回默认第 1 页、每页 10 条', async () => {
      const { status, body } = await doFetch('/api/books')

      expect(status).toBe(200)
      expect(body.total).toBeGreaterThan(0)
      expect(body.list).toHaveLength(10)
      expect(body.page).toBe(1)
      expect(body.pageSize).toBe(10)
    })

    it('支持 page / pageSize 分页切片', async () => {
      const { body } = await doFetch('/api/books?page=2&pageSize=5')

      expect(body.page).toBe(2)
      expect(body.pageSize).toBe(5)
      expect(body.list).toHaveLength(5)
      expect(body.total).toBe(body.list.length > 0 ? body.total : 0)
      // 校验第二页的第一条与第一页不重复
      const first = await (await fetch(`${ORIGIN}/api/books?page=1&pageSize=5`)).json()
      const ids1 = first.list.map((b: { id: number }) => b.id)
      const ids2 = body.list.map((b: { id: number }) => b.id)
      expect(new Set([...ids1, ...ids2]).size).toBe(ids1.length + ids2.length)
    })

    it('支持 keyword 按书名/作者过滤', async () => {
      const { body } = await doFetch('/api/books?keyword=vue')

      expect(body.total).toBeGreaterThan(0)
      body.list.forEach((b: { title: string; author: string }) => {
        expect(`${b.title} ${b.author}`.toLowerCase()).toContain('vue')
      })
      // 无关关键字返回空列表
      const none = await (await fetch(`${ORIGIN}/api/books?keyword=不存在的书名xyz`)).json()
      expect(none.list).toHaveLength(0)
      expect(none.total).toBe(0)
    })
  })

  describe('POST /api/books 新增', () => {
    it('新增图书返回 201 并写入自增 id', async () => {
      const newBook = { title: '测试新书', author: '测试者', year: '2024', rating: 5, onSale: true, stock: 1 }
      const { status, body } = await doFetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      })

      expect(status).toBe(201)
      expect(body).toMatchObject(newBook)
      expect(body.id).toBeTypeOf('number')

      // 新增后能通过列表查到
      const list = await (await fetch(`${ORIGIN}/api/books?keyword=测试新书`)).json()
      expect(list.total).toBeGreaterThan(0)
    })
  })

  describe('PUT /api/books/:id 编辑', () => {
    it('更新存在的图书并返回新数据', async () => {
      // 先取一个 id
      const list = await (await fetch(`${ORIGIN}/api/books`)).json()
      const id = list.list[0].id

      const { status, body } = await doFetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: 999 }),
      })

      expect(status).toBe(200)
      expect(body.id).toBe(id)
      expect(body.stock).toBe(999)
    })

    it('更新不存在的图书返回 404', async () => {
      const { status, body } = await doFetch('/api/books/99999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: 0 }),
      })

      expect(status).toBe(404)
      expect(body.message).toBe('图书不存在')
    })
  })

  describe('DELETE /api/books/:id 删除', () => {
    it('删除图书返回 success，且列表不再包含该 id', async () => {
      // 新增一本用于删除，避免影响既有数据
      const created = await doFetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '待删除书', author: 'x', year: '2024', rating: 4, onSale: true, stock: 1 }),
      })
      const id = created.body.id

      const { status, body } = await doFetch(`/api/books/${id}`, { method: 'DELETE' })
      expect(status).toBe(200)
      expect(body).toEqual({ success: true })

      const list = await (await fetch(`${ORIGIN}/api/books?keyword=待删除书`)).json()
      expect(list.total).toBe(0)
    })
  })
})

describe('登录与错误演示接口', () => {
  it('POST /api/login 返回 token 与用户信息', async () => {
    const { status, body } = await doFetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '测试用户' }),
    })

    expect(status).toBe(200)
    expect(body.token).toMatch(/^mock-token-/)
    expect(body.userInfo).toMatchObject({ name: '测试用户', role: '读者' })
  })

  it('POST /api/simulate/500 返回状态 500', async () => {
    const { status } = await doFetch('/api/simulate/500', { method: 'POST' })
    expect(status).toBe(500)
  })

  it('GET /api/protected 未带 Authorization 返回 401', async () => {
    const { status, body } = await doFetch('/api/protected')
    expect(status).toBe(401)
    expect(body.message).toBe('未登录或登录已过期')
  })

  it('GET /api/protected 带 Authorization 返回受保护数据', async () => {
    const res = await fetch(`${ORIGIN}/api/protected`, {
      headers: { Authorization: 'Bearer demo-token' },
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.secret).toBe('这是受保护的数据')
    expect(body.auth).toBe('Bearer demo-token')
  })
})

// ===== 登录鉴权端到端流程 =====
// 走项目真实 api 层（axios + request.js 拦截器）+ Pinia store，
// 验证：登录 → 存 token → 请求自动带 Authorization 成功 → 无 token 返回 401
describe('登录鉴权端到端流程', () => {
  // 与 main.ts 一致：createApp().use(pinia) 才会安装持久化插件
  function setupPinia() {
    const p = createPinia()
    p.use(createPersistedState())
    const app = createApp({})
    app.use(p)
    return p
  }

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setupPinia()
    // 让 axios 使用 fetch adapter，并改为绝对 baseURL：
    // - fetch adapter 需要绝对 URL（原始 /api 相对路径在 node 环境无法解析）
    // - 绝对 origin 必须与 jsdom location.origin 一致，MSW 相对路径 handler 才能命中
    request.defaults.adapter = 'fetch'
    request.defaults.baseURL = `${ORIGIN}/api`
  })

  // request.js 响应拦截器在 401 时会把 window.location 跳到 /login，
  // 在 jsdom 中导航不可用、会抛错。此处用普通对象替换 location：
  // - href 保持绝对地址，MSW 才能用 location 解析相对 handler 路径
  // - 替换为普通对象后，拦截器赋 href 只是改对象属性，不再触发 jsdom 导航
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, href: `${ORIGIN}/`, pathname: '/' },
      writable: true,
    })
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('登录 → 存 token → 请求自动携带 Authorization 访问受保护接口成功', async () => {
    // 1) 登录拿到 token
    const loginResult = await login('测试用户')
    expect(loginResult.token).toMatch(/^mock-token-/)

    // 2) 存入 store
    const store = useUserStore()
    store.login(loginResult)
    expect(store.isLoggedIn).toBe(true)

    // 3) fetchProtected 走 request.get，拦截器自动读 store.token 附带 Authorization
    const data = await fetchProtected()
    expect(data.secret).toBe('这是受保护的数据')
    expect(data.auth).toBe(`Bearer ${loginResult.token}`)
  })

  it('未登录（无 token）时访问受保护接口返回 401', async () => {
    const store = useUserStore()
    expect(store.isLoggedIn).toBe(false)

    // store 无 token，fetchProtected 发出的请求不带 Authorization，应返回 401
    await expect(fetchProtected()).rejects.toBeTruthy()
  })
})