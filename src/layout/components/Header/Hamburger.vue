<template>
  <div class="hamburger" :class="{ 'is-active': isActive }" @click="toggleClick">
    <span />
    <span />
    <span />
  </div>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits('toggle-click')

const toggleClick = () => {
  emit('toggle-click')
}
</script>

<style scoped>
.hamburger {
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  cursor: pointer;
  transform: rotate(90deg);
}

.hamburger.is-active {
  transform: rotate(0deg);
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #333;
  margin: 4px 0;
  transition: all 0.3s;
}
</style>
