<script setup>
import { onMounted, onUnmounted } from 'vue'
const deviceOrientation = () => {
  const toggle = screen?.orientation?.type?.includes('landscape')
    ? document.documentElement.requestFullscreen
    : document.exitFullscreen

  try {
    toggle().catch(() => {})
  } catch (e) {}
}

onMounted(() => {
  screen.orientation.addEventListener('change', deviceOrientation)
})
onUnmounted(() => {
  screen.orientation.removeEventListener('change', deviceOrientation)
})
</script>
<template></template>
