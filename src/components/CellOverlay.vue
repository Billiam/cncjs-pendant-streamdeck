<script>
import { computed } from 'vue'

import { useEditorStore } from '@/stores/editor'
</script>

<script setup>
import { useScenesStore } from '@/stores/scenes'
import { arrayWrap } from '@/lib/enumerable'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

const props = defineProps({
  row: {
    type: Number,
  },
  column: {
    type: Number,
  },
  buttons: {
    type: Array,
  },
})
const editor = useEditorStore()
const scenes = useScenesStore()
const ui = useUiStore()

const { sceneName } = storeToRefs(ui)

const { activeRow, activeColumn } = storeToRefs(editor)

const gridRow = computed(() => props.row + 1)
const gridColumn = computed(() => props.column + 1)

const buttons = computed(() => {
  return arrayWrap(
    scenes.scene(sceneName.value)?.buttons?.[props.row]?.[props.column],
  )
})

const edit = () => {
  editor.setActiveRow(props.row)
  editor.setActiveColumn(props.column)
  editor.setActiveButton(props.buttons[0])
}
</script>

<template>
  <div
    class="overlay"
    :class="{
      active: activeRow === row && activeColumn === column,
      empty: buttons.length === 0,
    }"
  >
    <button class="btn" @click="edit">
      <img src="/icons/fluent-ui/edit.png" />

      {{ buttons.length }}
    </button>
  </div>
</template>

<style lang="scss">
.overlay {
  border: 1px dotted #eee;

  grid-row: v-bind(gridRow);
  grid-column: v-bind(gridColumn);
  pointer-events: none;

  border-radius: 3px;
  width: 144px;
  height: 144px;

  z-index: 100;
  position: relative;

  transition: border-radius 0.2s;

  &:hover {
    opacity: 1;
  }
  &.active {
    border-color: green;
    outline: 2px solid var(--color-highlight);
    outline-offset: 4px;
  }
  &.empty:not(.active) {
    border-color: rgba(255, 255, 255, 0.3);
  }
  .btn {
    pointer-events: all;
    position: absolute;
    bottom: 2px;
    right: 2px;
    padding: 6px;

    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: rgba(0, 0, 0, 0.7);
    color: #efefef;
    border-radius: 100px;

    opacity: 0.5;
    transition: opacity 0.2s;
    &:hover {
      opacity: 1;
      border-color: #fff;
    }

    img {
      vertical-align: middle;
      max-width: 20px;
    }
  }
}
</style>
