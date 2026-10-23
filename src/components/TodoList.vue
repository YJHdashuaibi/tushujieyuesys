<script setup lang="ts">
// 父组件通过 props 把 list 传进来，这里只管渲染
defineProps<{
  list: string[]
}>()

// 删除操作需要通知父组件删哪一项，于是用 emit 上报下标
const emit = defineEmits<{
  (e: 'remove', index: number): void
}>()
</script>

<template>
  <div>
    <ul v-if="list.length > 0">
      <li v-for="(item, index) in list" :key="index">
        <span>{{ item }}</span>
        <button @click="emit('remove', index)">删除</button>
      </li>
    </ul>

    <p v-else class="empty">清单还是空的，加点东西吧~</p>
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

li button {
  border: none;
  background: #e74c3c;
  color: #fff;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}

.empty {
  color: #999;
  text-align: center;
}
</style>