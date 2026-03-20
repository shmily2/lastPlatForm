<template>
    <!-- 组织架构 -->
    <el-tree-select v-model="searchForm[field.prop]" :data="orgTree" placeholder="请搜索组织架构" clearable filterable
        check-strictly :render-after-expand="false" style="width: 100%" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrgTree } from '@/mock/index'
const searchForm = ref({})
const field = ref({ prop: '' })
const orgTree = ref([])
onMounted(async() => {
   try {
    const res = await getOrgTree()
    if (res.code === 200) {
      orgTree.value = res.data
    }
  } catch (e) {
    console.error('加载组织架构失败:', e)
  }

})
</script>