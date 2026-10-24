import request from '../utils/request'

/**
 * 登录：传入用户名，返回 token 和用户信息
 * @param {string} username 用户名
 * @returns {Promise<{ token: string, userInfo: { name: string, role: string } }>}
 */
export function login(username) {
  return request.post('/login', { username })
}