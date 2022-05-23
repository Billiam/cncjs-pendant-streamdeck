<script setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  window.addEventListener('contextmenu', (e) => {
    if (e.pointerType !== 'mouse') {
      e.preventDefault()
      e.stopPropagation()
    }
  })
})
</script>
<template></template>
