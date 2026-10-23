import { defineStore } from 'pinia'

// 用户信息结构
interface UserInfo {
  name: string
  role: string
}

// 用户状态管理
export const useUserStore = defineStore('user', {
  // state：响应式数据
  state: () => ({
    token: '',
    userInfo: { name: '', role: '' } as UserInfo,
  }),

  // getters：派生状态，类似计算属性
  getters: {
    isLoggedIn: (state): boolean => !!state.token,
    username: (state): string => state.userInfo.name,
  },

  // actions：可包含异步逻辑，用于修改状态
  actions: {
    // 模拟登录，保存 token 和用户信息
    login(username: string) {
      this.token = 'mock-token-' + Date.now()
      this.userInfo = { name: username, role: '读者' }
    },

    // 退出登录，清空状态
    logout() {
      this.token = ''
      this.userInfo = { name: '', role: '' }
    },
  },

  // 选项式 store：启用持久化，刷新后保持登录态
  persist: true,
})