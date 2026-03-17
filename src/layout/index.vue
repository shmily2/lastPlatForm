<template>
  <div class="app-wrapper">
    <sidebar :is-collapse="isCollapse" />
    <div class="main-container" :class="{ 'is-collapse': isCollapse }">
      <header-bar @update:is-collapse="val => isCollapse = val" />
      <app-main />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar/index.vue'
import HeaderBar from './components/Header/index.vue'
import AppMain from './components/AppMain.vue'

const isCollapse = ref(false)
</script>

<style scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 210px);
  transition: width 0.28s;
}

.main-container.is-collapse {
  width: calc(100% - 64px);
}
</style>
