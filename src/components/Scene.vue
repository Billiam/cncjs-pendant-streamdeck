<script setup>
import { useButtonStore } from '../stores/buttons'
import { useUiStore } from '../stores/ui'
const { buttons: buttonConfig } = useButtonStore()
const { rows, columns } = useUiStore()
import Cell from './Cell.vue'
defineProps({
  buttons: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="scene">
    <template v-for="(_e, r) in rows">
      <Cell
        v-for="(_f, c) in columns"
        :key="`${r}-${c}-${buttons[r]?.[c]}`"
        :config="buttonConfig[buttons[r]?.[c]]"
      ></Cell>
    </template>
  </div>
</template>

<style scoped></style>
