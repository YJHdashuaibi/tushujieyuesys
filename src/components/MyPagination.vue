<script setup lang="ts">
// 通用分页组件：props 接收总数与当前页码/每页条数
// 通过 v-model:page / v-model:pageSize 双向绑定；变化时 emit 通知父组件
defineProps<{
  total: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
}>()

// 定义双向绑定事件，向父组件回传新值
const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'change'): void
}>()

// 页码变化：打印日志便于在 DevTools 中监测，并同步回父组件
function onCurrentChange(newPage: number) {
  console.log(`[MyPagination] 翻页 -> 第 ${newPage} 页`)
  emit('update:page', newPage)
  emit('change')
}

// 每页条数变化：打印日志便于在 DevTools 中监测，并同步回父组件
function onSizeChange(newSize: number) {
  console.log(`[MyPagination] 每页条数 -> ${newSize}`)
  emit('update:pageSize', newSize)
  emit('change')
}
</script>

<template>
  <el-pagination
    :total="total"
    :current-page="page || 1"
    :page-size="pageSize || 1"
    :page-sizes="pageSizes || [1, 2, 5, 10]"
    layout="total, sizes, prev, pager, next, jumper"
    background
    @current-change="onCurrentChange"
    @size-change="onSizeChange"
  />
</template>