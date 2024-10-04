<script setup>
import { onBeforeMount } from 'vue'

import { useFileList } from '@/lib/scene/file-list'
import { useUiStore } from '@/stores/ui'

import Cell from './Cell.vue'

const { rows, columns } = useUiStore()

const { buttons, loadFiles } = useFileList()

onBeforeMount(() => {
  loadFiles()
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

<style scoped></style>
