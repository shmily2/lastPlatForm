<template>
  <div class="table-wrapper">
    <el-table
      :data="tableData"
      :loading="loading"
      border
      stripe
      :height="height"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
        align="center"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        align="center"
      />

      <!-- 动态列 -->
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :align="column.align || 'center'"
        :fixed="column.fixed"
      >
        <template #default="{ row }">
          <!-- 自定义插槽 -->
          <slot
            v-if="column.slot"
            :name="column.slot"
            :row="row"
            :column="column"
          />
          <!-- 标签显示 -->
          <el-tag
            v-else-if="column.tag"
            :type="getTagType(row, column)"
          >
            {{ getTagText(row, column) }}
          </el-tag>
          <!-- 自定义格式化 -->
          <span v-else-if="column.formatter">
            {{ column.formatter(row[column.prop], row) }}
          </span>
          <!-- 默认显示 -->
          <span v-else>{{ row[column.prop] }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="showActions"
        label="操作"
        :min-width="actionMinWidth || 150"
        :width="actionWidth"
        :fixed="actionFixed || 'right'"
        align="center"
      >
        <template #default="{ row }">
          <slot name="actions" :row="row">
            <el-button
              v-if="actions.view"
              type="primary"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="actions.edit"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="actions.delete"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-wrapper">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    default: () => []
  },
  // 列配置
  columns: {
    type: Array,
    required: true
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否显示选择列
  selection: {
    type: Boolean,
    default: false
  },
  // 是否显示序号列
  showIndex: {
    type: Boolean,
    default: true
  },
  // 是否显示操作列
  showActions: {
    type: Boolean,
    default: true
  },
  // 操作按钮配置
  actions: {
    type: Object,
    default: () => ({
      view: true,
      edit: true,
      delete: true
    })
  },
  // 操作列宽度
  actionWidth: {
    type: Number,
    default: undefined
  },
  // 操作列最小宽度
  actionMinWidth: {
    type: Number,
    default: 150
  },
  // 操作列固定
  actionFixed: {
    type: String,
    default: 'right'
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: 'auto'
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 当前页
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页条数
  pageSize: {
    type: Number,
    default: 10
  },
  // 总条数
  total: {
    type: Number,
    default: 0
  },
  // 分页大小选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50, 100]
  }
})

const emit = defineEmits([
  'selection-change',
  'view',
  'edit',
  'delete',
  'size-change',
  'current-change'
])

// 获取标签类型
const getTagType = (row, column) => {
  if (typeof column.tag === 'function') {
    return column.tag(row[column.prop])
  }
  return column.tag
}

// 获取标签文本
const getTagText = (row, column) => {
  if (column.tagText && typeof column.tagText === 'function') {
    return column.tagText(row[column.prop])
  }
  return row[column.prop]
}

// 选择变化
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

// 查看
const handleView = (row) => {
  emit('view', row)
}

// 编辑
const handleEdit = (row) => {
  emit('edit', row)
}

// 删除
const handleDelete = (row) => {
  emit('delete', row)
}

// 分页大小变化
const handleSizeChange = (size) => {
  emit('size-change', size)
}

// 当前页变化
const handleCurrentChange = (page) => {
  emit('current-change', page)
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
}

/* 移动端表格调整 */
@media (max-width: 768px) {
  .table-wrapper :deep(.el-table) {
    font-size: 12px;
  }

  .table-wrapper :deep(.el-table__cell) {
    padding: 8px 0;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 移动端分页调整 */
@media (max-width: 768px) {
  .pagination-wrapper {
    justify-content: center;
  }

  .pagination-wrapper :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
