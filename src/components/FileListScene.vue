<script setup>
import { useFileList } from '@/lib/scene/file-list'
import { useUiStore } from '@/stores/ui'
const { rows, columns } = useUiStore()
import { onBeforeMount } from 'vue'
import Cell from './Cell.vue'

const { buttons, loadFiles } = useFileList()

onBeforeMount(() => {
  loadFiles()
})
</script>

<template>
  <div class="scene">
    <template v-for="(row, r) in buttons">
      <template v-for="(cell, c) in row" :key="`${r}-${c}-${cell}`">
        <Cell :config="cell" :row="r" :column="c"></Cell>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
