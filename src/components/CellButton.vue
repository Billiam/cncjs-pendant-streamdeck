<script>
import ButtonHandler from '@/services/button-handler'
import vPointerHold from '@/directives/pointer-hold'
import vMultiPointer from '@/directives/multi-pointer'
import { inject } from 'vue'
</script>

<script setup>
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import { computed, ref, onBeforeUnmount } from 'vue'

const cnc = useCncStore()
const ui = useUiStore()

const buttonHandler = inject('buttonHandler')

const props = defineProps({
  actions: {
    type: Array,
    default: [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const active = ref(false)
const holding = ref(false)
let skipUpEvent = false

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
  return buttonHandler.getHandlers(props.actions)
})

const configDownActions = computed(() => events.value.down ?? [])
const configUpActions = computed(() => events.value.up ?? [])
const configHoldActions = computed(() => events.value.hold ?? [])
const configEnsureActions = computed(() => {
  return buttonHandler.ensureHandler(props.actions)
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
  return !props.disabled && Object.keys(events.value).length > 0
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
  <button
    v-if="hasButton"
    v-pointer-hold="
      hasHoldAction && { down: setHold, up: unsetHold, complete: onHold }
    "
    v-multi-pointer="{
      down: downHandler,
      up: upHandler,
      cancel: cancelClick,
    }"
    @touchstart.prevent
    class="button no-touch"
    :class="{ active, holding }"
    ref="button"
  >
    <span class="cell-container">
      <slot></slot>
    </span>
    <svg class="progress-bar centered-decoration" viewBox="0 0 100 100">
      <circle
        class="progress-bar-meter"
        cx="50"
        cy="50"
        r="40"
        v-if="holding"
      />
    </svg>
  </button>
  <div class="cell-container" v-else>
    <slot></slot>
  </div>
</template>
