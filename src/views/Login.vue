<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟登录：存 token 后跳转到图书列表
function handleLogin() {
  localStorage.setItem('library_token', 'demo-token')
  router.push('/books')
}
</script>

<template>
  <div class="login">
    <div class="card">
      <h1>📚 图书系统登录</h1>
      <p class="sub">欢迎回来，请登录后继续</p>
      <button @click="handleLogin">模拟登录</button>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #1f3b4d 0%, #2c5e8c 100%);
  box-sizing: border-box;
}

.card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 12px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

h1 {
  font-size: 22px;
  margin: 0 0 8px;
  color: #1f3b4d;
}

.sub {
  color: #888;
  margin: 0 0 24px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #42b883;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.2s;
}

button:hover {
  opacity: 0.9;
}

button:active {
  transform: scale(0.98);
}
</style>