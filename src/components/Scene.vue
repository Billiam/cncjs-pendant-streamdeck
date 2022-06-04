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
const arrayWrap = (n) => {
  if (Array.isArray(n)) {
    return n
  } else {
    return [n]
  }
}
</script>

<template>
  <div class="scene">
    <template v-for="(_e, r) in rows">
      <template v-for="(_f, c) in columns">
        <Cell
          v-for="cell in arrayWrap(buttons[r]?.[c])"
          :key="`${r}-${c}-${cell}`"
          :config="buttonConfig[cell]"
          :row="r"
          :column="c"
        ></Cell>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
