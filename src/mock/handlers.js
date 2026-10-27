import { http, HttpResponse } from 'msw'

// ===== 内存中的图书数据源 =====
let books = [
  { id: 1, title: 'JavaScript 高级程序设计', author: 'Nicholas C. Zakas', year: '2019', rating: 4.5, onSale: true, stock: 8 },
  { id: 2, title: 'Vue.js 设计与实现', author: '霍春阳', year: '2022', rating: 5, onSale: true, stock: 12 },
  { id: 3, title: '你不知道的 JavaScript', author: 'Kyle Simpson', year: '2017', rating: 4, onSale: true, stock: 5 },
  { id: 4, title: 'Vue.js 权威指南', author: '尤雨溪', year: '2020', rating: 4, onSale: true, stock: 3 },
  { id: 5, title: '深入理解 ES6', author: 'Nicholas C. Zakas', year: '2018', rating: 4.5, onSale: true, stock: 7 },
  { id: 6, title: 'CSS 权威指南', author: 'Eric A. Meyer', year: '2016', rating: 3.5, onSale: false, stock: 0 },
  { id: 7, title: 'HTML5 与 CSS3 实战', author: '徐涛', year: '2021', rating: 3.5, onSale: true, stock: 6 },
  { id: 8, title: 'JavaScript 忍者秘籍', author: 'John Resig', year: '2015', rating: 4, onSale: true, stock: 4 },
  { id: 9, title: 'TypeScript 编程', author: 'Basarat Ali Syed', year: '2022', rating: 4.5, onSale: true, stock: 9 },
  { id: 10, title: 'Node.js 实战', author: 'Mike Cantelon', year: '2020', rating: 3.5, onSale: false, stock: 0 },
  { id: 11, title: 'Webpack 深入浅出', author: '陈楠', year: '2019', rating: 3, onSale: true, stock: 2 },
  { id: 12, title: '设计模式：可复用面向对象', author: 'Erich Gamma', year: '2014', rating: 4.5, onSale: true, stock: 10 },
  { id: 13, title: '计算机网络：自顶向下', author: 'James Kurose', year: '2018', rating: 4, onSale: true, stock: 6 },
  { id: 14, title: '操作系统概念', author: 'Abraham Silberschatz', year: '2015', rating: 3.5, onSale: true, stock: 5 },
  { id: 15, title: '数据库系统概论', author: '王珊', year: '2019', rating: 3.5, onSale: false, stock: 0 },
  { id: 16, title: '算法导论', author: 'Thomas H. Cormen', year: '2013', rating: 4.5, onSale: true, stock: 8 },
  { id: 17, title: '代码整洁之道', author: 'Robert C. Martin', year: '2016', rating: 4, onSale: true, stock: 11 },
  { id: 18, title: '重构：改善既有代码', author: 'Martin Fowler', year: '2017', rating: 4, onSale: true, stock: 7 },
  { id: 19, title: '深入浅出 Vue.js', author: '刘博文', year: '2021', rating: 4, onSale: true, stock: 4 },
  { id: 20, title: 'React 设计模式与最佳实践', author: 'Michele Bertoli', year: '2020', rating: 3.5, onSale: true, stock: 6 }
]
let nextId = 21 // 自增主键

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

  // 2) 分页图书列表：按 page/pageSize 切片，按 keyword 过滤（书名或作者包含）
  http.get('/api/books', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() || ''
    // 关键字过滤（匹配书名或作者）
    const filtered = keyword
      ? books.filter((b) =>
          `${b.title} ${b.author}`.toLowerCase().includes(keyword)
        )
      : books
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
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