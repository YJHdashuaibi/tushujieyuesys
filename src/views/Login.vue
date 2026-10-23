<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 用户名
const username = ref('')

// 登录：写入 store 状态并跳转到图书列表页
function handleLogin() {
  const name = username.value.trim()
  if (!name) {
    alert('请输入用户名')
    return
  }
  userStore.login(name)
  router.push('/books')
}
</script>

<template>
  <div class="login">
    <div class="card">
      <h1>📚 图书系统登录</h1>
      <p class="sub">欢迎回来，请登录后继续</p>
      <input
        v-model="username"
        class="input"
        type="text"
        placeholder="请输入用户名"
        @keyup.enter="handleLogin"
      />
      <button @click="handleLogin">登录</button>
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

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  margin-bottom: 16px;
  border: 1px solid #d7dce0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #42b883;
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