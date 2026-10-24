import request from '../utils/request'

/**
 * 分页获取图书列表
 * @param {number} [page] 页码
 * @returns {Promise<{ list: Array, total: number, page: number, pageSize: number }>}
 */
export function getBooks(page = 1) {
  return request.get('/books', { params: { page } })
}

// 新增图书
export function addBook(data) {
  return request.post('/books', data)
}

// 编辑图书
export function updateBook(id, data) {
  return request.put(`/books/${id}`, data)
}

// 删除图书
export function deleteBook(id) {
  return request.delete(`/books/${id}`)
}

// 触发 500 的本接口（用于观察响应拦截器行为）
export function triggerServerError() {
  return request.post('/simulate/500')
}

// 需要 Authorization 否则返回 401（用于观察响应拦截器行为）
export function fetchProtected() {
  return request.get('/protected')
}