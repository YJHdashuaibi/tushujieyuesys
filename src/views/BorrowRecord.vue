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

// 根据状态返回对应的 el-tag 类型（success=归还，warning=借阅中）
function tagType(status: string): 'success' | 'warning' {
  return status === '已归还' ? 'success' : 'warning'
}

// 查询某日期（YYYY-MM-DD）当天应还的图书，供日历标记与 tooltip 展示
function booksDueOn(dateStr: string) {
  return records.filter((r) => r.dueDate === dateStr)
}

// 工具提示内容：列出当天到期图书，用"、 "连接
function dueText(dateStr: string) {
  return booksDueOn(dateStr).map((r) => r.title).join('、')
}
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

    <!-- 借阅日历：在 el-calendar 上通过 el-tooltip 展示每天应还图书 -->
    <el-calendar class="borrow-calendar">
      <template #date-cell="{ data }">
        <!-- 日期数字 -->
        <span class="cal-day">{{ data.day.slice(8) }}</span>
        <!-- 当天有应还图书时，用 tooltip 悬停展示 -->
        <el-tooltip
          v-if="booksDueOn(data.day).length"
          :content="`应还：${dueText(data.day)}`"
          placement="top"
          effect="dark"
        >
          <span class="cal-dot">{{ booksDueOn(data.day).length }}到期</span>
        </el-tooltip>
      </template>
    </el-calendar>

    <!-- 借阅记录表格：el-table + 状态标签 el-tag -->
    <el-table :data="records" border stripe style="width: 100%">
      <el-table-column prop="title" label="书名" min-width="180" />
      <el-table-column prop="date" label="借阅日期" width="120" />
      <el-table-column prop="dueDate" label="应还日期" width="120" />
      <!-- 状态列：根据状态渲染不同颜色的 el-tag -->
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="tagType(row.status)" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 无记录占位 -->
      <template #empty>
        <el-empty description="暂无借阅记录" />
      </template>
    </el-table>
  </div>
</template>

<style scoped>
/* 借阅日历 */
.borrow-calendar {
  margin-bottom: 20px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

/* 单元格内容：日期数字 + 到期标记 */
.borrow-calendar :deep(.el-calendar-table .el-calendar-day) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px;
  font-size: 13px;
}

.cal-day {
  font-weight: 600;
  color: var(--color-text);
}

/* 到期标记小圆点 */
.cal-dot {
  font-size: 11px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #e67e22, #e74c3c);
  cursor: pointer;
}

/* 表格容器在手机上留出边距 */
@media (max-width: 640px) {
  .page {
    padding: 12px;
  }
}
</style>