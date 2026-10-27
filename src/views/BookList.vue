<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getBooks, addBook, updateBook, deleteBook } from '../api/book'
import MyPagination from '../components/MyPagination.vue'

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

// 分页 / 搜索状态
const page = ref(1)
const pageSize = ref(1)
const keyword = ref('')

// 汇总统计
const borrowedCount = computed(() => books.value.filter((b) => b.borrowed).length)
const availableCount = computed(() => totalBooks.value - borrowedCount.value)

// 弹窗与表单状态
const modalVisible = ref(false)
const modalTitle = ref('新增图书')
const submitting = ref(false)
const editingId = ref<number | null>(null)
// 表单数据与校验规则（书名、作者必填）
const formRef = ref()
// 表单数据：书名、作者必填；评分、上架状态、库存
const form = reactive<{
  title: string
  author: string
  rating: number
  onSale: boolean
  stock: number
}>({ title: '', author: '', rating: 0, onSale: true, stock: 0 })
const rules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

// 刷新列表：按当前分页 / 关键字重新请求
async function refreshList() {
  // 请求开始即显示加载遮罩
  loading.value = true
  const start = Date.now()
  try {
    const data = await getBooks({ page: page.value, pageSize: pageSize.value, keyword: keyword.value })
    books.value = data.list.map((b: any) => ({
      category: '未分类',
      borrowed: false,
      rating: b.rating ?? 0,
      onSale: b.onSale ?? true,
      stock: b.stock ?? 0,
      ...b
    }))
    totalBooks.value = data.total
  } catch (e) {
    // 打印具体错误，便于在 DevTools 定位 mock 是否生效
    console.error('[BookList] 加载图书失败', e)
    alert(`加载图书失败：${(e as Error).message || e}`)
  } finally {
    // 保证遮罩至少展示 MIN_LOADING 毫秒，避免快速请求时闪烁
    const MIN_LOADING = 500
    const remain = MIN_LOADING - (Date.now() - start)
    setTimeout(() => {
      loading.value = false
    }, remain > 0 ? remain : 0)
  }
}

// 搜索：重置页码并重新请求
function handleSearch() {
  page.value = 1
  refreshList()
}

// 切换分页：页码 / 每页条数变化时重新请求
function handlePageChange() {
  refreshList()
}

// 挂载时拉取第一页图书
onMounted(refreshList)

// 打开新增弹窗（重置为空表单）
function openAdd() {
  editingId.value = null
  modalTitle.value = '新增图书'
  formRef.value?.clearValidate()
  Object.assign(form, { title: '', author: '', rating: 0, onSale: true, stock: 0 })
  modalVisible.value = true
}

// 打开编辑弹窗（回填当前行数据）
function openEdit(book: any) {
  editingId.value = book.id
  modalTitle.value = '编辑图书'
  formRef.value?.clearValidate()
  Object.assign(form, {
    title: book.title,
    author: book.author,
    rating: book.rating ?? 0,
    onSale: book.onSale ?? true,
    stock: book.stock ?? 0
  })
  modalVisible.value = true
}

// 提交：先校验，通过后再新增或编辑
function handleSubmit() {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
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
  })
}

// 删除图书：二次确认后调接口并刷新
async function handleDelete(book: any) {
  // 用户取消时 confirm 会 reject，直接 return
  try {
    await ElMessageBox.confirm(`确定删除《${book.title}》吗？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteBook(book.id)
    ElMessage.success('删除成功')
    await refreshList()
  } catch {
    ElMessage.error('删除失败')
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

    <!-- 搜索框 -->
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索书名或作者"
        clearable
        style="max-width: 300px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 图书表格：v-loading 绑定加载中状态，空数据显示 el-empty -->
    <el-table v-loading="loading" :data="books" border stripe style="width: 100%">
      <el-table-column prop="title" label="书名" min-width="180" />
      <el-table-column prop="author" label="作者" min-width="120" />
      <!-- 评分列：el-rate 只读展示 -->
      <el-table-column label="评分" width="160" align="center">
        <template #default="{ row }">
          <el-rate :model-value="row.rating ?? 0" disabled size="small" />
        </template>
      </el-table-column>
      <!-- 库存列 -->
      <el-table-column prop="stock" label="库存" width="80" align="center" />
      <!-- 上架状态列：el-switch 只读展示 -->
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.onSale ? 'success' : 'info'" size="small">
            {{ row.onSale ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 操作列：编辑 / 删除 -->
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <!-- 无数据时的占位 -->
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 分页组件：双向绑定页码/每页条数，变化时触发重新请求 -->
    <MyPagination
      v-model:page="page"
      v-model:pageSize="pageSize"
      :total="totalBooks"
      class="pager"
      @change="handlePageChange"
    />

    <!-- 新增 / 编辑弹窗：el-dialog + el-form -->
    <el-dialog v-model="modalVisible" :title="modalTitle" width="460px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="书名" prop="title">
          <el-input v-model="form.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="请输入作者" />
        </el-form-item>
        <!-- 评分：el-rate 星型评分 -->
        <el-form-item label="评分">
          <el-rate v-model="form.rating" :max="5" show-score />
        </el-form-item>
        <!-- 上架状态：el-switch 开关 -->
        <el-form-item label="上架">
          <el-switch v-model="form.onSale" active-text="上架" inactive-text="下架" />
        </el-form-item>
        <!-- 库存数量：el-input-number 数字输入 -->
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" :max="9999" :step="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitting ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
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

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

/* 分页 */
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}

/* 页头操作区 */
.header-actions {
  display: flex;
  gap: 10px;
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
}
</style>