<script setup lang="ts">
// 借阅记录数据（示例）
const records = [
  { id: 1, title: 'JavaScript 高级程序设计', date: '2026-10-01', status: '借阅中' },
  { id: 2, title: 'Vue.js 设计与实现', date: '2026-09-15', status: '已归还' }
]
</script>

<template>
  <div class="records">
    <h2>🗒️ 借阅记录</h2>

    <div class="list">
      <div v-for="record in records" :key="record.id" class="record-card">
        <div class="row">
          <span class="title">{{ record.title }}</span>
          <span class="status" :class="record.status === '已归还' ? 'back' : 'borrowing'">
            {{ record.status }}
          </span>
        </div>
        <p class="date">借阅于 {{ record.date }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #1f3b4d;
}

.date {
  margin: 10px 0 0;
  color: #888;
  font-size: 13px;
}

/* 状态标签 */
.status {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  flex-shrink: 0;
}

.back {
  color: #42b883;
  background: rgba(66, 184, 131, 0.12);
}

.borrowing {
  color: #e67e22;
  background: rgba(230, 126, 34, 0.12);
}
</style>