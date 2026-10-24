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
    // 登录成功，写入接口返回的 token 和用户信息
    login(data: { token: string; userInfo: UserInfo }) {
      this.token = data.token
      this.userInfo = data.userInfo
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