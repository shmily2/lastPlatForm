<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

/* 弹框滚动条修复 */
.el-overlay-dialog {
  overflow: hidden !important;
}

/* 弹框居中 */
.el-dialog {
  margin: 0 auto !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}
</style>
