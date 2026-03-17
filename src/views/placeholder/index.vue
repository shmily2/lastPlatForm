<template>
  <div class="placeholder">
    <el-result icon="info" title="页面建设中" sub-title="该功能正在开发中，敬请期待">
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
</script>

<style scoped>
.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
