import { defineStore } from 'pinia'

// 页面状态接口
interface PageState {
  path: string
  name: string
  title: string
  visits: number
}

// 页面状态 store：用于监测当前页面信息
export const usePageStore = defineStore('page', {
  // state：页面状态
  state: () => ({
    currentPath: '', // 当前路由路径
    currentName: '', // 当前路由名称
    currentTitle: '', // 当前页面标题
    visitHistory: [] as PageState[], // 访问历史
  }),

  // getters：派生状态
  getters: {
    // 是否已切换到目标页面
    isOnPage: (state): ((path: string) => boolean) => {
      return (path) => state.currentPath === path
    },
    // 获取某页面的访问次数
    visitCount: (state): ((path: string) => number) => {
      return (path) =>
        state.visitHistory.find((item) => item.path === path)?.visits ?? 0
    },
  },

  // actions：更新页面状态
  actions: {
    // 登录跳转时更新当前页面信息
    setPage(to: { path: string; name?: string | null | symbol; meta: { title?: string } }) {
      this.currentPath = to.path
      this.currentName = to.name?.toString() ?? ''
      this.currentTitle = to.meta.title ?? ''

      // 记录访问历史并累加次数
      const exist = this.visitHistory.find((item) => item.path === to.path)
      if (exist) {
        exist.visits++
      } else {
        this.visitHistory.push({
          path: to.path,
          name: to.name?.toString() ?? '',
          title: to.meta.title ?? '',
          visits: 1,
        })
      }
    },
    // 清空页面状态（可用于退出登录时重置）
    reset() {
      this.currentPath = ''
      this.currentName = ''
      this.currentTitle = ''
      this.visitHistory = []
    },
  },
})