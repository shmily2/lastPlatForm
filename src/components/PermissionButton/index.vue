<template>
  <el-button
    v-if="hasPermission"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const props = defineProps({
  permission: {
    type: [String, Array],
    required: true
  }
})

defineEmits(['click'])

const userStore = useUserStore()

const hasPermission = computed(() => {
  const permissions = userStore.permissions

  // 如果有超级权限，直接返回true
  if (permissions.includes('*:*:*')) {
    return true
  }

  // 处理多个权限的情况（满足其中一个即可）
  if (Array.isArray(props.permission)) {
    return props.permission.some(p => permissions.includes(p))
  }

  return permissions.includes(props.permission)
})
</script>
