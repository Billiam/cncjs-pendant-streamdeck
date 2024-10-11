<script>
import { computed, onBeforeMount } from 'vue'

import { useFileList } from '@/lib/scene/file-list'
import { useUiStore } from '@/stores/ui'
</script>

<script setup>
import Cell from './Cell.vue'
import { storeToRefs } from 'pinia'

defineProps({
  editor: {
    type: Boolean,
    default: false,
  },
})
const ui = useUiStore()

const { rows, columns, textSize } = storeToRefs(ui)

const { buttons, loadFiles } = useFileList()

onBeforeMount(() => {
  loadFiles()
})

const fontSize = computed(() => {
  return `${textSize}em`
})
</script>

<template>
  <div class="scene">
    <template v-for="(row, r) in buttons">
      <template v-for="(cell, c) in row" :key="`${r}-${c}-${cell?.key || 0}`">
        <Cell :config="cell" :row="r" :column="c"></Cell>
      </template>
    </template>
  </div>
</template>

<style scoped>
:deep(.cell) {
  font-size: v-bind(fontSize);
}
</style>
