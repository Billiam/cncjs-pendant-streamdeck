<script>
import CellButton from './CellButton.vue'
import evaluate from 'simple-evaluate'
import TextTemplate from '@/lib/text-template'
</script>
<script setup>
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'
import Color from '@/lib/color'

const alignment = {
  'top left': { v: 'top', h: 'left' },
  'top center': { v: 'top', h: 'center' },
  'top right': { v: 'top', h: 'right' },
  left: { v: 'center', h: 'left' },
  center: { v: 'center', h: 'center' },
  right: { v: 'center', h: 'right' },
  'bottom left': { v: 'bottom', h: 'left' },
  'bottom center': { v: 'bottom', h: 'center' },
  'bottom right': { v: 'bottom', h: 'right' },
}
const cnc = useCncStore()
const ui = useUiStore()
const { bgColor, textColor, progressColor } = storeToRefs(ui)

const buttonHandler = inject('buttonHandler')

const color = Color()

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
})

// Text content
const textTemplate = computed(() => TextTemplate(props.config.text))
const textString = computed(() => textTemplate.value({ cnc, ui }))

const fontSize = computed(() => {
  return `${props.config.textSize || 1}em`
})

// color configuration
const cellBgColor = computed(() =>
  color.normalizeColor(props.config.bgColor || bgColor.value)
)
const cellProgressColor = computed(() =>
  color.normalizeColor(progressColor.value)
)

const cellActiveColor = computed(() => color.highlightColor(cellBgColor.value))
const cellTextColor = computed(() => color.normalizeColor(textColor.value))
const textAlignment = computed(
  () => alignment[props.config.textAlignment]?.h ?? 'center'
)
const textVerticalAlignment = computed(
  () => alignment[props.config.textAlignment]?.v ?? 'center'
)

const show = computed(() => {
  return !props.config.if || evaluate({ cnc, ui }, props.config.if)
})

const enabled = computed(() => buttonHandler.enabled(props.config.actions))
</script>

<template>
  <div
    class="cell"
    draggable="false"
    :class="{ disabled: !enabled }"
    v-if="show"
  >
    <cell-button :actions="config.actions" :disabled="!enabled">
      <img
        class="icon centered-decoration"
        :src="'icons/' + config.icon"
        :alt="config.description"
        v-if="config.icon"
        draggable="false"
      />
      <span
        class="text-wrapper"
        :class="[textAlignment, `vertical-${textVerticalAlignment}`]"
      >
        <span class="button-text" v-if="config.text" v-text="textString"></span>
      </span>
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
}
.cell:not(.disabled) {
  .button::before {
    content: '';
    background: linear-gradient(to bottom, #ffffff33 30%, transparent);
    position: absolute;
    top: 3%;
    left: 3%;
    right: 3%;
    height: 20%;
    border-radius: 5px 5px 0 0;
  }
}
.icon {
  filter: drop-shadow(2px 3px 0 #00000022);
}

.text-wrapper {
  position: relative;
  font-size: v-bind(fontSize);
  line-height: 1.2;
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

.button-text {
  font-family: monospace;
  white-space: pre-line;
  color: v-bind(cellTextColor);
  user-select: none;
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

.centered-decoration {
  position: absolute;
  margin: 0 auto;
  left: 0;
  top: 50%;
  right: 0;
  max-height: 100%;
  max-width: 100%;
  width: 100%;
  object-fit: contain;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>
<style scoped>
:deep(.progress-bar-meter) {
  stroke: v-bind(cellProgressColor);
}
.cell {
  background-color: v-bind(cellBgColor);
  grid-row-start: v-bind(row + 1);
  grid-row-end: v-bind(row + 1);
  grid-column-start: v-bind(column + 1);
  grid-column-end: v-bind(column + 1);
}
.cell.disabled {
  background-color: transparent;
}
.button.active {
  background-color: v-bind(cellActiveColor);
}
</style>
