<script>
import ButtonHandler from '@/services/button-handler'
import vPointerUpOutside from '@/directives/pointer-up-outside'
import vPointerHold from '@/directives/pointer-hold'
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
const { bgColor, textColor, progressColor } = storeToRefs(ui)

const color = Color()

const props = defineProps({
  config: {
    type: Object,
    default: {},
  },
})

const active = ref(false)
const holding = ref(false)
let skipUpEvent = false

// Text content
const textTemplate = computed(() => {
  return compile(props.config.text, { whitespace: 'preserve' })
})
const textString = computed(() => {
  return textTemplate.value({ cnc, ui }, {})
})

const fontSize = computed(() => {
  return `${props.config.textSize || 1}rem`
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

// state toggling
const setActive = () => {
  active.value = true
}
const unsetActive = () => {
  active.value = false
}
const setHold = () => {
  holding.value = true
  skipUpEvent = false
}
const unsetHold = () => {
  holding.value = false
  skipUpEvent = false
}
const onHold = () => {
  active.value = false
  holding.value = false
  skipUpEvent = true
  callActions(configHoldActions.value)
}

// dynamic event binding
const events = computed(() => {
  return buttonHandler.getHandlers(props.config)
})

const configDownActions = computed(() => events.value.down ?? [])
const configUpActions = computed(() => events.value.up ?? [])
const configHoldActions = computed(() => events.value.hold ?? [])
const configEnsureActions = computed(() => {
  return buttonHandler.ensureHandler(props.config)
})
const hasHoldAction = computed(() => configHoldActions.value.length > 0)
const callActions = (actionSet) => {
  actionSet.forEach((config) => {
    config.action(...(config.arguments || []))
  })
}

const downHandler = computed(() => {
  return () => {
    if (!active.value) {
      setActive()
      callActions(configDownActions.value)
    }
  }
})

const upHandler = computed(() => {
  return () => {
    const wasActive = active.value
    unsetActive()

    if (skipUpEvent) {
      skipUpEvent = false
      return
    }
    if (wasActive) {
      callActions(configUpActions.value)
    }
  }
})

const hasButton = computed(() => {
  return Object.keys(events.value).length > 0
})

const cancelClick = () => {
  const wasActive = active.value
  active.value = false

  if (wasActive && configEnsureActions.value) {
    callActions(configEnsureActions.value)
  }
}

onBeforeUnmount(() => {
  unsetHold()
  if (!active.value) {
    return
  }

  if (configEnsureActions.value) {
    callActions(configEnsureActions.value)
  }
})
</script>

<template>
  <div class="cell" draggable="false">
    <button
      v-if="hasButton"
      v-pointer-up-outside="cancelClick"
      v-pointer-hold="
        hasHoldAction && { down: setHold, up: unsetHold, complete: onHold }
      "
      @pointerdown="downHandler()"
      @pointerup="upHandler()"
      @touchstart.prevent
      class="button no-touch"
      :class="{ active, holding }"
      ref="button"
    >
      <img
        class="icon centered-decoration"
        :src="'icons/' + config.icon"
        :alt="config.description"
        v-if="config.icon"
        draggable="false"
      />
      <svg
        class="progress-bar centered-decoration"
        v-if="holding"
        viewBox="0 0 100 100"
      >
        <circle class="progress-bar-meter" cx="50" cy="50" r="40" />
      </svg>
      <span class="button-text" v-if="config.text" v-text="textString"></span>
    </button>

    <div class="cell-container" v-else-if="config">
      <img
        class="icon centered-decoration"
        :src="'icons/' + config.icon"
        :alt="config.description"
        v-if="config.icon"
      />
      <div class="text-wrapper">
        <span class="button-text" v-if="config.text" v-text="textString"></span>
      </div>
    </div>
  </div>
</template>

<style>
.cell {
  position: relative;
  overflow: hidden;
}
.cell-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.text-wrapper {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  font-size: v-bind(fontSize);
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
.progress-bar-meter {
  stroke: v-bind(cellProgressColor);
}
.cell {
  background-color: v-bind(cellBgColor);
}
.button.active {
  background-color: v-bind(cellActiveColor);
}
</style>
