<script setup lang="ts">
// 借阅记录数据（示例）
const records = [
  {
    id: 1,
    title: 'JavaScript 高级程序设计',
    date: '2026-10-01',
    dueDate: '2026-10-20',
    status: '借阅中'
  },
  {
    id: 2,
    title: 'Vue.js 设计与实现',
    date: '2026-09-15',
    dueDate: '2026-10-05',
    status: '已归还'
  }
]

const borrowing = records.filter((r) => r.status === '借阅中').length
const returned = records.filter((r) => r.status === '已归还').length
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>🗒️ 借阅记录</h1>
        <p class="page-subtitle">
          当前借阅 {{ borrowing }} 本 · 历史归还 {{ returned }} 本
        </p>
      </div>
    </div>

    <div class="list">
      <div v-for="record in records" :key="record.id" class="record-card">
        <div class="record-cover">{{ record.title.charAt(0) }}</div>

        <div class="record-body">
          <div class="row">
            <span class="title">{{ record.title }}</span>
            <span
              class="status"
              :class="record.status === '已归还' ? 'back' : 'borrowing'"
            >
              {{ record.status }}
            </span>
          </div>

          <div class="dates">
            <span>借阅于 {{ record.date }}</span>
            <span>应还 {{ record.dueDate }}</span>
          </div>

          <!-- 进度条：借阅进度演示 -->
          <div class="progress">
            <div
              class="progress-bar"
              :class="record.status === '已归还' ? 'done' : 'active'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="records.length === 0" class="empty">
      暂无借阅记录
    </div>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 记录卡片 */
.record-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 18px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.record-cover {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #e67e22, #e74c3c);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-body {
  flex: 1;
  min-width: 0;
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
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* 状态标签 */
.status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

.back {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.borrowing {
  color: var(--color-warning);
  background: var(--color-warning-soft);
}

/* 进度条（演示借阅周期） */
.progress {
  margin-top: 12px;
  height: 6px;
  border-radius: 4px;
  background: var(--color-border);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 65%;
  border-radius: 4px;
}

.progress-bar.active {
  background: linear-gradient(90deg, var(--color-primary), #42b883);
}

.progress-bar.done {
  background: var(--color-accent);
  width: 100%;
}

/* 手机端：卡片内间距收紧 */
@media (max-width: 480px) {
  .record-card {
    padding: 14px 12px;
    gap: 10px;
  }

  .dates {
    gap: 4px 12px;
  }
}
</style>