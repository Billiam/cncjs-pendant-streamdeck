<script setup>
import { onMounted, onUnmounted } from 'vue'
const deviceOrientation = () => {
  if (screen?.orientation?.type?.includes('landscape')) {
    document.documentElement.requestFullscreen()
  } else {
    try {
      document.exitFullscreen()
    } catch (e) {}
  }
}

onMounted(() => {
  screen.orientation.addEventListener('change', deviceOrientation)
})
onUnmounted(() => {
  screen.orientation.removeEventListener('change', deviceOrientation)
})
</script>
<template></template>
