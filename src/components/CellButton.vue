<script>
import vPointerHold from '@/directives/pointer-hold'
import vMultiPointer from '@/directives/multi-pointer'

import { inject, defineEmits } from 'vue'
</script>

<script setup>
import { useButton } from '@/lib/cell/button'
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import { computed, onBeforeUnmount } from 'vue'

const cnc = useCncStore()
const ui = useUiStore()

const buttonActions = inject('buttonActions')

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

const events = computed(() => {
  return buttonActions.value?.getHandlers(props.actions)
})
const cleanupActions = computed(() => {
  return buttonActions.value?.ensureHandler(props.actions)
})
const {
  active,
  cancelClick,
  clearActivity,
  configEnsureActions,
  downHandler,
  hasButton,
  hasHoldAction,
  onHold,
  holding,
  setHold,
  unsetHold,
  upHandler,
} = useButton(events, cleanupActions)

// state toggling
onBeforeUnmount(() => {
  clearActivity()
})
</script>

<template>
  <button
    v-if="!disabled && hasButton"
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
    <svg
      v-if="holding"
      class="progress-bar centered-decoration"
      viewBox="0 0 100 100"
    >
      <circle class="progress-bar-meter" cx="50" cy="50" r="40" />
    </svg>
  </button>
  <div class="cell-container" v-else>
    <slot></slot>
  </div>
</template>
