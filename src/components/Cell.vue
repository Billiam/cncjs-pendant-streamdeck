<script>
import { storeToRefs } from 'pinia'
import { computed, inject, toRefs } from 'vue'

import { useColor } from '@/lib/cell/color'
import { useLoading } from '@/lib/cell/loading'
import { useText } from '@/lib/cell/text'
import { useVisibility } from '@/lib/cell/visibility'
import { useCncStore } from '@/stores/cnc'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'

import CellButton from './CellButton.vue'
import GcodePreview from './GcodePreview.vue'
</script>
<script setup>
const cnc = useCncStore()
const ui = useUiStore()
const gcode = useGcodeStore()

const { textShadow, rows, columns } = storeToRefs(ui)

const buttonActions = inject('buttonActions')
const props = defineProps({
  config: {
    type: Object,
    default: {},
  },
  row: {
    type: Number,
  },
  column: {
    type: Number,
  },
  name: {
    type: String,
  },
})
const { config, row, column } = toRefs(props)

const { cellBgColor, cellProgressColor, cellActiveColor } = useColor(config)
const {
  cellTextColor,
  contrastingTextColor,
  fontSize,
  font,
  lineHeight,
  textAlignment,
  textVerticalAlignment,
  textString,
} = useText(config)
const { show, enabled } = useVisibility(config, buttonActions)
const { loading } = useLoading(config)

const gridPosition = computed(() => {
  return {
    startRow: row.value + 1,
    endRow: row.value + 1 + (config.value.rows || 1),
    startColumn: column.value + 1,
    endColumn: column.value + 1 + (config.value.columns || 1),
  }
})
const aspectRatio = computed(
  () => (config.value.columns || 1) / (config.value.rows || 1),
)
</script>

<template>
  <div
    class="cell"
    draggable="false"
    :class="{ disabled: !enabled }"
    :aria-label="config.description"
    :title="config.description"
    v-if="show"
  >
    <div class="name" v-if="name">{{ name }}</div>
    <cell-button :actions="config.actions" :disabled="!enabled">
      <span class="image centered-decoration" v-if="config.icon"></span>

      <gcode-preview
        v-if="config.type === 'gcodePreview'"
        :animated="config.animated"
      ></gcode-preview>

      <span
        class="text-wrapper"
        v-if="config.text"
        :class="[
          textAlignment,
          `vertical-${textVerticalAlignment}`,
          { 'text-shadow': textShadow },
        ]"
      >
        <span class="button-text" v-text="textString"></span>
      </span>

      <svg
        v-if="loading"
        class="loading-animation centered-decoration"
        viewBox="0 0 100 100"
      >
        <circle class="loading-circle" cx="50" cy="50" r="40" />
      </svg>
    </cell-button>
  </div>
</template>

<style lang="scss">
.cell {
  position: relative;
  overflow: hidden;
}
.cell-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2%;
  display: block;
}
.cell.disabled {
  opacity: 0.3;
}
.button {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  font-size: inherit;
}
.cell:not(.disabled) {
  .button::before {
    content: '';
    background: linear-gradient(to bottom, #ffffff55 30%, transparent);
    position: absolute;
    top: 3%;
    left: 3%;
    right: 3%;
    height: 20%;
    max-height: 40px;
    border-radius: 5px 5px 0 0;
  }
}
.gcode-preview {
  position: absolute;
  left: 5%;
  top: 5%;

  width: 90%;
  height: 90%;
}
.icon {
  filter: drop-shadow(2px 3px 0 #00000022);
}

.text-wrapper {
  padding: 0 5px;
  position: relative;
  font-size: v-bind(fontSize);
  font-family: v-bind(font);
  line-height: v-bind(lineHeight);
  white-space: pre-line;
  color: v-bind(cellTextColor);
  user-select: none;

  display: block;
  &.vertical-center {
    top: 50%;
    transform: translateY(-50%);
  }
  &.vertical-bottom {
    top: 100%;
    transform: translateY(-100%);
  }
  &.left {
    text-align: left;
  }
  &.right {
    text-align: right;
  }
  &.center {
    text-align: center;
  }
}
.loading {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  margin: auto;
  aspect-ratio: 1/1;
}
.loading-circle {
  animation: loading-animation 5s linear infinite;
  fill: none;
  stroke-width: 5px;
  stroke-linecap: round;
  stroke-dasharray: 360;
  stroke-dashoffset: 360;
  transform-origin: 50% 50%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 10px black);
}
.button {
  position: relative;
  border: 0;
  background: none;
  touch-action: none;
  pointer-events: all;
}
.progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  margin: auto;
  aspect-ratio: 1/1;
}
.progress-bar-meter {
  animation: progress-animation 350ms linear;
  animation-delay: 150ms;
  fill: none;
  stroke-width: 10px;
  stroke-linecap: round;
  stroke-dasharray: 360;
  stroke-dashoffset: 360;
  transform-origin: 50% 50%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 10px black);
}

@keyframes progress-animation {
  from {
    stroke-dashoffset: 360;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes loading-animation {
  0% {
    stroke-dashoffset: 360;
    transform: rotate(0);
  }
  25% {
    stroke-dashoffset: 235;
    transform: rotate(360deg);
  }
  50% {
    stroke-dashoffset: 110;
    transform: rotate(720deg);
  }
  75% {
    stroke-dashoffset: 235;
    transform: rotate(1080deg);
  }
  100% {
    stroke-dashoffset: 360;
    transform: rotate(1440deg);
  }
}
.centered-decoration {
  position: absolute;
  margin: 0 auto;
  left: 0;
  top: 50%;
  right: 0;
  height: 100%;
  width: 100%;
  object-fit: contain;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
<style scoped>
.image {
  background: v-bind('`url("icons/${config.icon}")`') no-repeat center center;
  background-size: contain;
}
:deep(.progress-bar-meter) {
  stroke: v-bind(cellProgressColor);
}
.loading-circle {
  stroke: v-bind(cellProgressColor);
}
.cell {
  background-color: v-bind(cellBgColor);
  grid-row-start: v-bind(gridPosition.startRow);
  grid-row-end: v-bind(gridPosition.endRow);
  grid-column-start: v-bind(gridPosition.startColumn);
  grid-column-end: v-bind(gridPosition.endColumn);
  z-index: v-bind(
    10 +
      (
        (rows * columns) -
          (gridPosition.startRow * columns + gridPosition.startColumn)
      )
  );
  position: relative;
}
.cell.disabled {
  background-color: transparent;
}
.button.active {
  background-color: v-bind(cellActiveColor);
}
.text-shadow {
  /*text-shadow: v-bind(`0 0.1em #0006`);*/
  /*-webkit-text-stroke: v-bind(`2px ${contrastingTextColor}`);*/
  /*paint-order: stroke fill;*/
}
.name {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  z-index: 50;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
