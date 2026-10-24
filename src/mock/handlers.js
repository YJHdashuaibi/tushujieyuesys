import { http, HttpResponse } from 'msw'

// ===== 内存中的图书数据源 =====
let books = [
  { id: 1, title: 'JavaScript 高级程序设计', author: 'Nicholas C. Zakas', year: '2019' },
  { id: 2, title: 'Vue.js 设计与实现', author: '霍春阳', year: '2022' },
  { id: 3, title: '你不知道的 JavaScript', author: 'Kyle Simpson', year: '2017' }
]
let nextId = 4 // 自增主键

export const handlers = [
  // 1) 登录：接收 username，返回 token 和用户信息
  http.post('/api/login', async ({ request }) => {
    const body = await request.json()
    const name = body?.username || '读者'
    return HttpResponse.json({
      token: 'mock-token-' + Date.now(),
      userInfo: { name, role: '读者' }
    })
  }),

  // 500 演示：模拟服务器错误（观察响应拦截器的 500 分支）
  http.post('/api/simulate/500', () => {
    return HttpResponse.json(
      { message: '服务器内部错误（模拟）' },
      { status: 500 }
    )
  }),

  // 401 演示：需要 Authorization 头，缺失时返回 401（观察响应拦截器的 401 分支）
  http.get('/api/protected', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth) {
      return HttpResponse.json({ message: '未登录或登录已过期' }, { status: 401 })
    }
    return HttpResponse.json({ secret: '这是受保护的数据', auth })
  }),

  // 2) 分页图书列表：支持 page / pageSize 参数；page 大于 5 时返回空列表演示空数据
  http.get('/api/books', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    // 空数据演示：页码过大时返回空列表
    if (page > 5) {
      return HttpResponse.json({ list: [], total: 0, page, pageSize })
    }
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      list: books.slice(start, start + pageSize),
      total: books.length,
      page,
      pageSize
    })
  }),

  // 3) 新增图书
  http.post('/api/books', async ({ request }) => {
    const body = await request.json()
    const book = { id: nextId++, ...body }
    books.push(book)
    return HttpResponse.json(book, { status: 201 })
  }),

  // 4) 编辑图书：按 id 更新
  http.put('/api/books/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = await request.json()
    const index = books.findIndex((b) => b.id === id)
    if (index === -1) {
      return HttpResponse.json({ message: '图书不存在' }, { status: 404 })
    }
    books[index] = { ...books[index], ...body, id }
    return HttpResponse.json(books[index])
  }),

  // 5) 删除图书
  http.delete('/api/books/:id', ({ params }) => {
    const id = Number(params.id)
    books = books.filter((b) => b.id !== id)
    return HttpResponse.json({ success: true })
  })
]