<script setup>
import { useButtonStore } from '@/stores/buttons'
import { useUiStore } from '@/stores/ui'
import { arrayWrap } from '@/lib/enumerable'

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
