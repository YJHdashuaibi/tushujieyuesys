import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    // 登录页，无需登录
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    // Layout 作为父布局，嵌套子页面
    path: '/',
    component: () => import('../components/Layout.vue'),
    // 父布局下面的所有页面都需要登录
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/books'
      },
      {
        path: 'books',
        name: 'BookList',
        component: () => import('../views/BookList.vue'),
        meta: { title: '图书列表', requiresAuth: true }
      },
      {
        path: 'borrow-record',
        name: 'BorrowRecord',
        component: () => import('../views/BorrowRecord.vue'),
        meta: { title: '借阅记录', requiresAuth: true }
      }
    ]
  },
  {
    // 404 兜底，重定向到登录页
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 切换页面时回到顶部
    return { top: 0 }
  }
})

// 全局前置守卫：读取 localStorage 的 library_token 做鉴权
router.beforeEach((to, from) => {
  document.title = to.meta.title ? `${to.meta.title} - 图书借阅管理系统` : '图书借阅管理系统'

  const token = localStorage.getItem('library_token')

  // 目标页面需要登录但没有 token，跳回登录页
  if (to.meta.requiresAuth && !token) {
    return { path: '/login' }
  }

  // 已登录还想访问登录页，直接去图书列表
  if (to.path === '/login' && token) {
    return { path: '/books' }
  }
})

export default router