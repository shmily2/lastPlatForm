<template>
  <div class="breadcrumb-wrapper">
    <el-breadcrumb separator="/">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
          <span v-if="index === breadcrumbs.length - 1" class="no-redirect">
            {{ item.meta.title }}
          </span>
          <a v-else @click.prevent="handleLink(item)">
            {{ item.meta.title }}
          </a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbs = ref([])

// 获取面包屑
const getBreadcrumb = () => {
  let matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]

  // 如果第一个不是首页，添加首页
  if (first && first.path !== '/dashboard') {
    matched = [{ path: '/dashboard', meta: { title: '首页' } }].concat(matched)
  }

  breadcrumbs.value = matched
}

// 点击面包屑
const handleLink = (item) => {
  router.push(item.path)
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true }
)
</script>

<style scoped>
.breadcrumb-wrapper {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

/* 面包屑容器 */
.breadcrumb-wrapper :deep(.el-breadcrumb) {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 面包屑项 */
.breadcrumb-wrapper :deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

/* 面包屑链接 */
.breadcrumb-wrapper :deep(.el-breadcrumb__inner) {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-redirect {
  color: #97a8be;
  cursor: text;
}

a {
  color: #409eff;
  cursor: pointer;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .breadcrumb-wrapper :deep(.el-breadcrumb__inner) {
    max-width: 120px;
    font-size: 13px;
  }

  .breadcrumb-wrapper :deep(.el-breadcrumb__separator) {
    margin: 0 4px;
  }
}

@media (max-width: 480px) {
  .breadcrumb-wrapper :deep(.el-breadcrumb__inner) {
    max-width: 80px;
    font-size: 12px;
  }
}

.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
