<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { login } from '../api/auth'

const router = useRouter()
const userStore = useUserStore()

// 用户名与登录 loading 状态
const username = ref('')
const loading = ref(false)

// 登录：调用 auth 接口，成功后写入登录态并跳转
async function handleLogin() {
  const name = username.value.trim()
  if (!name) {
    alert('请输入用户名')
    return
  }
  loading.value = true
  try {
    const data = await login(name)
    userStore.login(data)
    router.push('/books')
  } catch (e) {
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="card">
      <div class="logo">📚</div>
      <h1>图书借阅系统</h1>
      <p class="sub">欢迎回来，请登录后继续</p>

      <div class="input-group">
        <span class="input-icon">👤</span>
        <input
          v-model="username"
          class="input"
          type="text"
          placeholder="请输入用户名"
          @keyup.enter="handleLogin"
        />
      </div>

      <button :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
      <p class="tip">演示项目 · 输入任意用户名即可登录</p>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #203651 0%, #2f63e0 100%);
  box-sizing: border-box;
}

/* 背景装饰圆 */
.card::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.card::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: -80px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3d7bfd, #42b883);
  color: #fff;
  font-size: 30px;
  line-height: 64px;
  box-shadow: var(--shadow-brand);
}

h1 {
  font-size: 22px;
  margin: 0 0 6px;
  color: var(--color-text);
}

.sub {
  color: var(--color-text-secondary);
  margin: 0 0 26px;
  font-size: 14px;
}

/* 带图标输入框 */
.input-group {
  position: relative;
  margin-bottom: 18px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: var(--color-text-muted);
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px 13px 42px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

button {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, #3d7bfd, #42b883);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s;
}

button:hover {
  box-shadow: var(--shadow-brand);
}

button:active {
  transform: scale(0.98);
}

.tip {
  margin: 18px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
}
</style>