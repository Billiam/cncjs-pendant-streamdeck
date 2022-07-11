import { computed, ref } from 'vue'

export const useButton = (events, cleanupActions) => {
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
  const configDownActions = computed(() => events.value.down ?? [])
  const configUpActions = computed(() => events.value.up ?? [])
  const configHoldActions = computed(() => events.value.hold ?? [])

  const hasHoldAction = computed(() => configHoldActions.value.length > 0)

  const callActions = (actionSet) => {
    actionSet.forEach((config) => {
      config.action(...(config.arguments || []))
    })
  }

  const downHandler = () => {
    if (!active.value) {
      setActive()
      callActions(configDownActions.value)
    }
  }

  const upHandler = () => {
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

  const hasButton = computed(() => {
    return Object.keys(events.value).length > 0
  })

  const cancelClick = () => {
    const wasActive = active.value
    active.value = false

    if (wasActive && cleanupActions.value) {
      callActions(cleanupActions.value)
    }
  }

  const clearActivity = () => {
    unsetHold()
    if (!active.value) {
      return
    }

    if (cleanupActions.value) {
      callActions(cleanupActions.value)
    }
    active.value = false
    holding.value = false
  }

  return {
    active,
    cancelClick,
    clearActivity,
    downHandler,
    hasButton,
    hasHoldAction,
    holding,
    onHold,
    setActive,
    setHold,
    unsetHold,
    upHandler,
  }
}
