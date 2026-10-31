import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MyPagination from '../../src/components/MyPagination.vue'

// 查找内部封装的分页组件 el-pagination
function findPagination(wrapper: ReturnType<typeof mount>) {
  return wrapper.findComponent({ name: 'ElPagination' })
}

describe('MyPagination', () => {
  it('正确透传 total / page / pageSize 等属性', () => {
    const wrapper = mount(MyPagination, {
      props: { total: 100, page: 3, pageSize: 10 },
    })

    const pagination = findPagination(wrapper)
    expect(pagination.exists()).toBe(true)
    expect(pagination.props('total')).toBe(100)
    expect(pagination.props('currentPage')).toBe(3)
    expect(pagination.props('pageSize')).toBe(10)
    expect(pagination.props('pageSizes')).toEqual([1, 2, 5, 10])
  })

  it('page / pageSize 缺省时使用默认值', () => {
    const wrapper = mount(MyPagination, {
      props: { total: 50 },
    })

    const pagination = findPagination(wrapper)
    expect(pagination.props('currentPage')).toBe(1)
    expect(pagination.props('pageSize')).toBe(1)
  })

  it('切换页码时触发 update:page 与 change', async () => {
    const wrapper = mount(MyPagination, {
      props: { total: 100, page: 1, pageSize: 10 },
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // 模拟用户点击下一页 -> el-pagination 派发 current-change
    await findPagination(wrapper).vm.$emit('current-change', 2)
    await nextTick()

    expect(wrapper.emitted('update:page')).toEqual([[2]])
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(logSpy).toHaveBeenCalledWith('[MyPagination] 翻页 -> 第 2 页')

    logSpy.mockRestore()
  })

  it('切换每页条数时触发 update:pageSize 与 change', async () => {
    const wrapper = mount(MyPagination, {
      props: { total: 100, page: 1, pageSize: 10 },
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await findPagination(wrapper).vm.$emit('size-change', 20)
    await nextTick()

    expect(wrapper.emitted('update:pageSize')).toEqual([[20]])
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(logSpy).toHaveBeenCalledWith('[MyPagination] 每页条数 -> 20')

    logSpy.mockRestore()
  })

  it('pageSizes 自定义选项被正确透传', () => {
    const wrapper = mount(MyPagination, {
      props: { total: 200, pageSizes: [5, 20, 50] },
    })

    expect(findPagination(wrapper).props('pageSizes')).toEqual([5, 20, 50])
  })
})