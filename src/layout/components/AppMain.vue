<template>
  <div class="app-main">
    <!-- <div class="breadcrumb-container">
      <el-breadcrumb separator-class="breadcrumb-separator">
        <el-breadcrumb-item :to="{ path: '/' }">
          <span class="breadcrumb-home">首页</span>
        </el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="item.path"
          :to="index < breadcrumbs.length - 1 ? { path: item.path } : undefined"
        >
          <span :class="{ 'breadcrumb-current': index === breadcrumbs.length - 1 }">
            {{ item.meta.title || item.name }}
          </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div> -->
    <div class="content-container">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" :key="key" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const key = computed(() => route.path)

const breadcrumbs = computed(() => {
  return route.matched.filter(item => item.meta?.title || item.name)
})
</script>

<style scoped>
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f0f2f5;
  width: 100%;
}

.breadcrumb-container {
  flex-shrink: 0;
  padding: 16px 20px 12px;
}

.breadcrumb-home {
  color: #606266;
  font-size: 14px;
}

.breadcrumb-home:hover {
  color: #409eff;
}

.breadcrumb-current {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  font-size: 14px;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #409eff;
}

:deep(.breadcrumb-separator) {
  color: #c0c4cc;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 过渡动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
