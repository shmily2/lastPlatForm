<template>
  <template v-if="menu.children && menu.children.length > 0">
    <el-sub-menu :index="menu.path">
      <template #title>
        <el-icon v-if="menu.icon">
          <component :is="getIcon(menu.icon)" />
        </el-icon>
        <span>{{ menu.title }}</span>
      </template>
      <menu-item
        v-for="child in menu.children"
        :key="child.id"
        :menu="child"
      />
    </el-sub-menu>
  </template>
  <template v-else>
    <el-menu-item :index="menu.path">
      <el-icon v-if="menu.icon">
        <component :is="getIcon(menu.icon)" />
      </el-icon>
      <template #title>
        <span>{{ menu.title }}</span>
      </template>
    </el-menu-item>
  </template>
</template>

<script setup>
import { User, UserFilled, Menu, Setting, Document, Tickets, Goods, DataAnalysis, TrendCharts, HomeFilled } from '@element-plus/icons-vue'

// 图标映射表
const iconMap = {
  User,
  UserFilled,
  Menu,
  Setting,
  Document,
  Tickets,
  Goods,
  DataAnalysis,
  TrendCharts,
  HomeFilled
}

defineProps({
  menu: {
    type: Object,
    required: true
  }
})

// 获取图标组件
const getIcon = (iconName) => {
  return iconMap[iconName] || Document
}
</script>
