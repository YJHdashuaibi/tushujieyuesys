<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 图书数据（示例）
const books = [
  { id: 1, title: 'JavaScript 高级程序设计', author: 'Nicholas C. Zakas', year: '2019' },
  { id: 2, title: 'Vue.js 设计与实现', author: '霍春阳', year: '2022' },
  { id: 3, title: '你不知道的 JavaScript', author: 'Kyle Simpson', year: '2017' }
]

// 退出登录：删除 token 后跳回登录页
function handleLogout() {
  localStorage.removeItem('library_token')
  router.push('/login')
}
</script>

<template>
  <div class="book-list">
    <div class="header">
      <h2>📖 图书列表</h2>
      <button class="logout" @click="handleLogout">退出登录</button>
    </div>

    <div class="grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <h3>{{ book.title }}</h3>
        <p>作者：{{ book.author }}</p>
        <span class="year">{{ book.year }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
}

.logout {
  border: none;
  background: #e74c3c;
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logout:hover {
  opacity: 0.85;
}

/* 卡片网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.book-card {
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.book-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #1f3b4d;
}

.book-card p {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.year {
  font-size: 13px;
  color: #42b883;
  background: rgba(66, 184, 131, 0.12);
  padding: 3px 10px;
  border-radius: 12px;
}

/* 手机端：网格变单列 */
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>