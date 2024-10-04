<script>
import { storeToRefs } from 'pinia'

import { arrayWrap } from '@/lib/enumerable'
import { useButtonStore } from '@/stores/buttons'
import { useUiStore } from '@/stores/ui'

import Cell from './Cell.vue'
import CellOverlay from './CellOverlay.vue'
</script>

<script setup>
const buttonStore = useButtonStore()
const ui = useUiStore()
const { columns, rows } = storeToRefs(ui)
const { buttons: buttonConfig } = storeToRefs(buttonStore)

defineProps({
  buttons: {
    type: Array,
    required: true,
  },
  editor: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="scene">
    <template v-for="(_e, r) in rows">
      <template v-for="(_f, c) in columns">
        <Cell
          v-for="buttonName in arrayWrap(buttons[r]?.[c])"
          :key="`${r}-${c}-${buttonName}`"
          :config="buttonConfig[buttonName]"
          :row="r"
          :column="c"
        ></Cell>
        <CellOverlay
          v-if="editor"
          :row="r"
          :column="c"
          :buttons="arrayWrap(buttons[r]?.[c])"
        ></CellOverlay>
      </template>
    </template>
  </div>
</template>

<style scoped></style>
