<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 退出登录：清空 store 后再回登录页
function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="layout">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
      <h1 class="logo">📚 图书借阅</h1>
      <!-- 显示当前登录用户名 -->
      <div class="user">{{ userStore.username }}</div>
      <nav>
        <!-- router-link 切换路由，router-link-active 自动高亮当前项 -->
        <RouterLink to="/books">📖 图书列表</RouterLink>
        <RouterLink to="/borrow-record">🗒️ 借阅记录</RouterLink>
      </nav>
      <!-- 退出登录 -->
      <button class="logout" @click="handleLogout">退出登录</button>
    </aside>

    <!-- 主区域：渲染子路由 -->
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* 整体布局：左右分栏 */
.layout {
  display: flex;
  height: 100vh;
}

/* 左侧菜单栏 */
.sidebar {
  width: 200px;
  background: #35495e;
  color: #fff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.logo {
  font-size: 16px;
  margin: 0;
}

/* 当前登录用户名 */
.user {
  font-size: 14px;
  color: #42b883;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 导航项 */
nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

nav a {
  color: #ccc;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

nav a:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 当前路由高亮 */
nav a.router-link-active {
  background: #42b883;
  color: #fff;
}

/* 退出按钮贴底部 */
.logout {
  margin-top: auto;
  border: none;
  background: #e74c3c;
  color: #fff;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logout:hover {
  opacity: 0.85;
}

/* 右侧内容区 */
.content {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  overflow: auto;
  box-sizing: border-box;
}

/* 手机 / 平板：侧边栏变成顶部横条 */
@media (max-width: 768px) {
  .layout {
    height: 100vh;
  }

  .sidebar {
    width: auto;
    padding: 10px 12px;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  .logo {
    font-size: 14px;
    white-space: nowrap;
  }

  .user {
    padding: 4px 8px;
    font-size: 12px;
  }

  nav {
    flex-direction: row;
    gap: 6px;
    flex: 1;
  }

  nav a {
    padding: 6px 10px;
    font-size: 13px;
  }

  .logout {
    margin-top: 0;
    padding: 6px 10px;
    font-size: 13px;
  }

  .content {
    padding: 16px;
  }
}
</style>