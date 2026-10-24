import axios from 'axios'
import { useUserStore } from '../stores/user'

// 创建 axios 实例：统一 baseURL 与超时时间
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器：自动携带登录 token
request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截器：统一处理业务状态码
request.interceptors.response.use(
  // 成功：兼容两种返回格式
  // - 有 code 字段：约定 { code, data, message }，code 200 返回 data
  // - 无 code 字段：视为直接返回数据（如 MSW mock 的裸响应）
  (response) => {
    const body = response.data || {}
    if (body.code === undefined) return body
    if (body.code === 200) return body.data
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  // 失败：按 HTTP 状态码分类处理
  (error) => {
    const status = error.response?.status
    const userStore = useUserStore()

    if (status === 401) {
      // 登录过期：清空登录态并跳回登录页
      userStore.logout()
      window.location.href = '/login'
    } else if (status === 500) {
      // 服务器错误：给出友好提示
      alert('服务器错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request