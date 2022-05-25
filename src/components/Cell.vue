<script>
import ButtonHandler from '@/services/button-handler'
const buttonHandler = ButtonHandler()
</script>

<script setup>
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { compile, computed, ref, onBeforeUnmount } from 'vue'
import Color from '@/lib/color'

const cnc = useCncStore()
const ui = useUiStore()
const { bgColor, textColor } = storeToRefs(ui)

const props = defineProps({
  config: {
    type: Object,
  },
})

const active = ref(false)

const color = Color()

const textTemplate = computed(() =>
  compile(props.config.text, { whitespace: 'preserve' })
)

const cellBgColor = computed(() =>
  color.normalizeColor(props.config?.bgColor || bgColor.value)
)

const cellActiveColor = computed(() => color.highlightColor(cellBgColor.value))

const cellTextColor = computed(() => color.normalizeColor(textColor.value))

const downHandler = () => {
  active.value = true
}

const upHandler = () => {
  active.value = false
}

const configClickHandler = computed(() => {
  return buttonHandler.clickHandler(props.config)
})
const configDownHandler = computed(() => {
  return buttonHandler.downHandler(props.config)
})
const configUpHandler = computed(() => {
  return active.value && buttonHandler.upHandler(props.config)
})

const hasButton = computed(() => {
  return (
    configClickHandler.value || configDownHandler.value || configUpHandler.value
  )
})

const textString = computed(() => textTemplate.value({ cnc }, {}))

onBeforeUnmount(() => {
  if (configUpHandler.value) {
    configUpHandler.value()
  }
})
</script>

<template>
  <div class="cell" draggable="false">
    <button
      v-if="hasButton"
      @pointerdown="downHandler(), configDownHandler && configDownHandler()"
      @pointerup="configUpHandler && configUpHandler(), upHandler($event)"
      @pointerleave="configUpHandler && configUpHandler(), upHandler($event)"
      @click="configClickHandler && configClickHandler()"
      class="button"
      :class="{ active, 'no-touch': configDownHandler }"
    >
      <img
        class="icon"
        :src="'icons/' + config.icon"
        :alt="config.description"
        v-if="config.icon"
        draggable="false"
      />
      <span class="button-text" v-if="config.text" v-text="textString"></span>
    </button>
    <div class="cell-container" v-else-if="config">
      <img
        class="icon"
        :src="'icons/' + config.icon"
        :alt="config.description"
        v-if="config.icon"
      />
      <span class="button-text" v-if="config.text" v-text="textString"></span>
    </div>
  </div>
</template>

<style>
.cell {
  position: relative;
  overflow: hidden;
}
.cell-container {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.button-text {
  font-family: monospace;
  white-space: pre;
  color: v-bind(cellTextColor);
  user-select: none;
}
.button {
  position: relative;
  border: 0;
  background: none;
  touch-action: none;
}
.icon {
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
.cell {
  background-color: v-bind(cellBgColor);
}
.button.active {
  background-color: v-bind(cellActiveColor);
}
</style>
