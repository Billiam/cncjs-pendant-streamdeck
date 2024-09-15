<script>
import { computed, onMounted, watchEffect } from 'vue'
import { useUiStore } from '@/stores/ui'
import Color from '@/lib/color'
</script>

<script setup>
const ui = useUiStore()

const color = Color()

const bgColor = computed(() => color.normalizeColor(ui.pageColor))

const dark = computed(() => {
  return bgColor.value || 'var(--vt-c-black)'
})
const light = computed(() => {
  return bgColor.value || 'var(--vt-c-white)'
})
const theme = computed(() => ({
  '--dark-background': dark.value,
  '--light-background': light.value,
}))

onMounted(() => {
  watchEffect(() => {
    document.documentElement.style.cssText = Object.entries(theme.value)
      .map(([k, v]) => `${k}:${v}`)
      .join(';')
  })
})
</script>
<template></template>
