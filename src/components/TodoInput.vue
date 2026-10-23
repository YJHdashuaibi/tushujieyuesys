<script setup lang="ts">
import { ref } from 'vue'

// 输入框文字只在本组件内部维护，父组件不关心
const input = ref('')

// 通过 emit 通知父组件“我要添加一项”
const emit = defineEmits<{
  (e: 'add', text: string): void
}>()

function handleAdd() {
  const text = input.value.trim()
  if (text === '') return
  emit('add', text)
  input.value = ''
}
</script>

<template>
  <div class="todo-input">
    <input
      v-model="input"
      type="text"
      placeholder="请输入要买的物品…"
      @keyup.enter="handleAdd"
    />
    <button @click="handleAdd">添加</button>
  </div>
</template>

<style scoped>
.todo-input {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.todo-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.todo-input button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}
</style>