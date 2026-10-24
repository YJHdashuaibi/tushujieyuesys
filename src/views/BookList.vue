<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getBooks, addBook, updateBook, deleteBook, triggerServerError } from '../api/book'

const router = useRouter()
const userStore = useUserStore()

// 图书列表、加载与空数据状态
const books = ref<Array<{
  id: number
  title: string
  author: string
  year: string
  category?: string
  borrowed?: boolean
}>>([])
const loading = ref(true)
const totalBooks = ref(0)

// 汇总统计
const borrowedCount = computed(() => books.value.filter((b) => b.borrowed).length)
const availableCount = computed(() => totalBooks.value - borrowedCount.value)

// 弹窗状态与表单数据
const modalVisible = ref(false)
const modalTitle = ref('新增图书')
const submitting = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  title: '',
  author: '',
  year: '',
  category: ''
})

// 刷新列表（重新拉取第一页）
async function refreshList() {
  try {
    const data = await getBooks(1)
    books.value = data.list.map((b: any) => ({
      category: '未分类',
      borrowed: false,
      ...b
    }))
    totalBooks.value = data.total
  } catch (e) {
    alert('加载图书失败')
  }
}

// 挂载时拉取第一页图书
onMounted(async () => {
  try {
    await refreshList()
  } finally {
    loading.value = false
  }
})

// 打开新增弹窗（重置表单）
function openAdd() {
  editingId.value = null
  modalTitle.value = '新增图书'
  Object.assign(form, { title: '', author: '', year: '', category: '' })
  modalVisible.value = true
}

// 打开编辑弹窗（回填当前书籍数据）
function openEdit(book: any) {
  editingId.value = book.id
  modalTitle.value = '编辑图书'
  Object.assign(form, {
    title: book.title,
    author: book.author,
    year: book.year,
    category: book.category || ''
  })
  modalVisible.value = true
}

// 提交表单：新增或编辑
async function handleSubmit() {
  if (!form.title.trim() || !form.author.trim()) {
    alert('请填写书名和作者')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateBook(editingId.value, { ...form })
    } else {
      await addBook({ ...form })
    }
    modalVisible.value = false
    await refreshList() // 操作后刷新列表
  } catch (e) {
    alert('保存失败')
  } finally {
    submitting.value = false
  }
}

// 删除图书
async function handleDelete(book: any) {
  if (!confirm(`确定删除《${book.title}》吗？`)) return
  try {
    await deleteBook(book.id)
    await refreshList()
  } catch (e) {
    alert('删除失败')
  }
}

// 测试 500 响应：触发响应拦截器的服务器错误提示
async function handleTest500() {
  try {
    await triggerServerError()
  } catch {
    // 拦截器已弹"服务器错误"提示，这里无需重复处理
  }
}

// 退出登录
function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>📖 图书列表</h1>
        <p class="page-subtitle">共 {{ totalBooks }} 本图书，均在馆藏中</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openAdd">＋ 新增图书</button>
        <button class="btn" @click="handleTest500">测试 500</button>
        <button class="btn btn-danger" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats">
      <div class="stat-card">
        <span class="stat-icon">📚</span>
        <p class="stat-num">{{ totalBooks }}</p>
        <p class="stat-label">藏书总数</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📖</span>
        <p class="stat-num">{{ availableCount }}</p>
        <p class="stat-label">可借阅</p>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🔖</span>
        <p class="stat-num">{{ borrowedCount }}</p>
        <p class="stat-label">已借出</p>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="empty">⏳ 加载中...</div>

    <!-- 空数据提示（接口返回空列表时展示） -->
    <div v-else-if="books.length === 0" class="empty">📭 暂无图书数据</div>

    <!-- 图书卡片网格 -->
    <div v-else class="grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <div class="book-cover">{{ book.title.charAt(0) }}</div>
        <div class="book-info">
          <span class="category">{{ book.category }}</span>
          <h3>{{ book.title }}</h3>
          <p class="author">作者：{{ book.author }}</p>
          <div class="book-footer">
            <span class="year">{{ book.year }}</span>
            <span class="status" :class="book.borrowed ? 'borrowed' : 'available'">
              {{ book.borrowed ? '已借出' : '可借阅' }}
            </span>
          </div>
          <div class="book-actions">
            <button class="btn btn-sm" @click="openEdit(book)">编辑</button>
            <button class="btn btn-sm btn-danger" @click="handleDelete(book)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <div v-if="modalVisible" class="modal-mask" @click.self="modalVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close" @click="modalVisible = false">✕</button>
        </div>
        <div class="modal-body">
          <label class="field">
            <span>书名</span>
            <input v-model="form.title" class="input" type="text" placeholder="请输入书名" />
          </label>
          <label class="field">
            <span>作者</span>
            <input v-model="form.author" class="input" type="text" placeholder="请输入作者" />
          </label>
          <label class="field">
            <span>年份</span>
            <input v-model="form.year" class="input" type="text" placeholder="如 2024" />
          </label>
          <label class="field">
            <span>分类</span>
            <input v-model="form.category" class="input" type="text" placeholder="如 前端 / Java" />
          </label>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="modalVisible = false">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 统计卡片 */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 18px 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.stat-icon {
  font-size: 24px;
}

.stat-num {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* 卡片网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.book-card {
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

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* 封面占位 */
.book-cover {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #3d7bfd, #42b883);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.category {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  margin-bottom: 6px;
}

.book-info h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-text);
}

.author {
  margin: 6px 0 10px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.book-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.year {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 借阅状态 */
.status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.available {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.borrowed {
  color: var(--color-warning);
  background: var(--color-warning-soft);
}

/* 加载 / 空数据提示 */
.empty {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-muted);
  font-size: 15px;
}

/* 页头操作区 */
.header-actions {
  display: flex;
  gap: 10px;
}

/* 主色按钮兜底（.btn 默认已是主色） */
.btn-primary {
  background: var(--color-primary);
}

/* 小号按钮（卡片内操作） */
.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* 卡片操作按钮排 */
.book-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--color-border);
}

/* ===== 弹窗 ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  color: var(--color-text);
}

.modal-close {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: 4px 8px;
}

.modal-close:hover {
  color: var(--color-text);
}

.modal-body {
  padding: 20px;
}

.field {
  display: block;
  margin-bottom: 16px;
}

.field span {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.field .input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.field .input:focus {
  border-color: var(--color-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
}

/* 手机端：统计卡片与网格 */
@media (max-width: 480px) {
  .header-actions {
    flex-wrap: nowrap;
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
    padding: 10px 8px;
    font-size: 13px;
    white-space: nowrap;
  }

  .stats {
    gap: 8px;
  }

  .stat-card {
    padding: 14px 6px;
  }

  .stat-num {
    font-size: 22px;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>