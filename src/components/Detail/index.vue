<template>
  <el-descriptions
    :column="column"
    :border="border"
    :size="size"
    :direction="direction"
    :label-style="labelStyle"
    :content-style="contentStyle"
  >
    <el-descriptions-item
      v-for="item in items"
      :key="item.prop"
      :label="item.label"
      :label-class-name="item.labelClassName"
      :content-class-name="item.contentClassName"
      :span="item.span || 1"
      :align="item.align || 'center'"
    >
      <!-- 自定义插槽 -->
      <slot
        v-if="item.slot"
        :name="item.slot"
        :item="item"
        :data="data"
      />
      <!-- 标签显示 -->
      <el-tag
        v-else-if="item.tag"
        :type="getTagType(item)"
      >
        {{ getTagText(item) }}
      </el-tag>
      <!-- 图片显示 -->
      <el-image
        v-else-if="item.type === 'image'"
        :src="getImageUrl(item)"
        :preview-src-list="[getImageUrl(item)]"
        fit="cover"
        style="width: 100px; height: 100px"
      />
      <!-- 链接显示 -->
      <el-link
        v-else-if="item.type === 'link'"
        :href="data[item.prop]"
        :type="item.linkType || 'primary'"
        :target="item.target || '_blank'"
      >
        {{ data[item.prop] || '-' }}
      </el-link>
      <!-- 自定义格式化 -->
      <span v-else-if="item.formatter">
        {{ item.formatter(data[item.prop], data) }}
      </span>
      <!-- 默认显示 -->
      <span v-else>{{ data[item.prop] || '-' }}</span>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  // 数据对象
  data: {
    type: Object,
    default: () => ({})
  },
  // 描述项配置
  items: {
    type: Array,
    required: true
  },
  // 列数
  column: {
    type: Number,
    default: 3
  },
  // 是否显示边框
  border: {
    type: Boolean,
    default: true
  },
  // 尺寸
  size: {
    type: String,
    default: 'default'
  },
  // 排列方向
  direction: {
    type: String,
    default: 'horizontal'
  },
  // 标签样式
  labelStyle: {
    type: Object,
    default: () => ({ width: '120px' })
  },
  // 内容样式
  contentStyle: {
    type: Object,
    default: () => ({})
  }
})

// 获取标签类型
const getTagType = (item) => {
  const value = props.data[item.prop]

  if (typeof item.tag === 'function') {
    return item.tag(value)
  }

  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger',
    true: 'success',
    false: 'danger',
    启用: 'success',
    禁用: 'danger',
    正常: 'success',
    异常: 'danger',
    成功: 'success',
    失败: 'danger',
    待处理: 'warning',
    处理中: 'primary',
    已完成: 'success',
    已取消: 'info'
  }

  return typeMap[value] || 'info'
}

// 获取标签文本
const getTagText = (item) => {
  const value = props.data[item.prop]

  if (item.tagText && typeof item.tagText === 'function') {
    return item.tagText(value)
  }

  const textMap = {
    0: '禁用',
    1: '启用',
    true: '是',
    false: '否'
  }

  return textMap[value] || value || '-'
}

// 获取图片URL
const getImageUrl = (item) => {
  const value = props.data[item.prop]

  if (Array.isArray(value)) {
    return value[0]?.url || value[0]
  }

  return value || ''
}
</script>
