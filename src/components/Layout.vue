<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePageStore } from '../stores/page'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const pageStore = usePageStore()

const active = ref(false)

// 路由切换时，关闭移动端菜单
watch(
  () => route.path,
  () => {
    active.value = false
  }
)

// 退出登录：清空 store 后再回登录页
function handleLogout() {
  userStore.logout()
  pageStore.reset()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <!-- 移动端顶部栏 -->
    <header class="topbar">
      <button class="burger" aria-label="菜单" @click="active = !active">
        <span v-for="i in 3" :key="i" :class="['line', { on: active }]"></span>
      </button>
      <span class="topbar-logo">📚 图书借阅</span>
      <RouterLink class="topbar-user" to="/books" :title="userStore.username">
        👤
      </RouterLink>
    </header>

    <!-- 遮罩层（移动端打开菜单时） -->
    <div v-if="active" class="mask" @click="active = false"></div>

    <!-- 侧边栏 / 抽屉 -->
    <aside class="sidebar" :class="{ open: active }">
      <h1 class="logo">📚 图书借阅</h1>

      <div class="user">
        <span class="avatar">👤</span>
        <span class="user-name">{{ userStore.username }}</span>
        <span class="user-role">{{ userStore.userInfo.role }}</span>
      </div>

      <nav>
        <RouterLink to="/books">📖 图书列表</RouterLink>
        <RouterLink to="/borrow-record">🗒️ 借阅记录</RouterLink>
      </nav>

      <div class="monitor">
        <p class="monitor-title">📍 页面监测</p>
        <p>当前页面：{{ pageStore.currentTitle || '—' }}</p>
        <p>路由路径：{{ pageStore.currentPath || '—' }}</p>
        <p>📖 图书列表：{{ pageStore.visitCount('/books') }} 次</p>
        <p>🗒️ 借阅记录：{{ pageStore.visitCount('/borrow-record') }} 次</p>
      </div>

      <button class="logout" @click="handleLogout">退出登录</button>
    </aside>

    <!-- 主区域 -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* 整体布局 */
.layout {
  display: flex;
  min-height: 100vh;
}

/* ===== 侧边栏 ===== */
.sidebar {
  position: sticky;
  top: 0;
  width: var(--sidebar-width);
  height: 100vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 16px;
  background: linear-gradient(180deg, var(--color-sidebar) 0%, var(--color-sidebar-deep) 100%);
  color: #fff;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  margin: 4px 8px 0;
  letter-spacing: 0.5px;
}

/* 用户信息卡片 */
.user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
}

.avatar {
  font-size: 20px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(66, 184, 131, 0.25);
  color: #7fe0b3;
  flex-shrink: 0;
}

/* 导航 */
nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #cdd7e4;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.2s, color 0.2s;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

nav a.router-link-active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-brand);
}

/* 页面监测面板 */
.monitor {
  background: rgba(0, 0, 0, 0.22);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 12px;
  line-height: 1.9;
  color: #aebbcf;
}

.monitor-title {
  margin: 0 0 4px;
  font-weight: 700;
  color: #7fe0b3;
}

.monitor p:not(.monitor-title) {
  margin: 0;
}

/* 退出按钮 */
.logout {
  margin-top: auto;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #e8edf3;
  padding: 11px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: background 0.2s;
}

.logout:hover {
  background: var(--color-danger);
  color: #fff;
}

/* ===== 主内容 ===== */
.content {
  flex: 1;
  min-width: 0;
  background: var(--color-bg);
}

/* ===== 移动端顶部栏 & 抽屉 ===== */
.topbar {
  display: none;
}

.mask {
  display: none;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }

  /* 顶部横条（含刘海屏安全区） */
  .topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    height: calc(var(--header-height) + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) 14px 0;
    background: var(--color-sidebar);
    color: #fff;
    position: sticky;
    top: 0;
    z-index: 30;
  }

  .burger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    padding: 8px;
  }

  .burger .line {
    display: block;
    height: 2px;
    width: 100%;
    background: #fff;
    border-radius: 2px;
    transition: transform 0.25s, opacity 0.25s;
  }

  /* 汉堡按钮变化为 X */
  .burger .line:nth-child(1).on {
    transform: translateY(7px) rotate(45deg);
  }
  .burger .line:nth-child(2).on {
    opacity: 0;
  }
  .burger .line:nth-child(3).on {
    transform: translateY(-7px) rotate(-45deg);
  }

  .topbar-logo {
    font-weight: 700;
    font-size: 16px;
    flex: 1;
  }

  .topbar-user {
    font-size: 20px;
    color: #fff;
    text-decoration: none;
  }

  /* 遮罩 */
  .mask {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(16, 24, 40, 0.5);
    z-index: 20;
  }

  /* 抽屉化侧边栏 */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 25;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    box-shadow: var(--shadow-lg);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* 内容区加上部内边距，避免被顶部栏遮挡（顶部栏 sticky 占位） */
  .content {
    flex: 1;
    background: var(--color-bg);
  }
}
</style>