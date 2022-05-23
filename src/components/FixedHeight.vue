<script setup>
import { onBeforeMount, onBeforeUnmount } from 'vue'

const setHeight = () => {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
onBeforeMount(() => {
  setHeight()
  window.addEventListener('resize', setHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setHeight)
})
</script>
<template></template>
