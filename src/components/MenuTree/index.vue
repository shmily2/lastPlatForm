<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="true"
    :collapse-transition="false"
    mode="vertical"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409eff"
    @select="handleSelect"
  >
    <menu-item v-for="menu in menuList" :key="menu.id" :menu="menu" />
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MenuItem from './MenuItem.vue'

const props = defineProps({
  menuList: {
    type: Array,
    default: () => []
  },
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['menuClick'])

const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 选择菜单
const handleSelect = (index) => {
  emit('menuClick', index)
  router.push(index)
}
</script>

<style scoped>
.el-menu {
  border-right: none;
}
</style>
