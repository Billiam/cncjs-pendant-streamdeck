import { useButton } from '@/lib/cell/button'
import { computed } from 'vue'

export default class ButtonHandler {
  constructor(actions, buttonActions) {
    this.buttonActions = buttonActions
    this.actions = actions
    this.setup()
  }

  // may need to track multiple buttons in the same space
  down(index) {
    if (this.active.value) {
      return
    }

    this.buttons.add(index)
    this.downHandler()

    if (this.hasHoldAction.value) {
      this.setHold()
      this.holdTimer = setTimeout(() => {
        this.onHold()
      }, 500)
    }
  }

  up(index) {
    if (!this.active.value || !this.buttons.has(index)) {
      return
    }
    this.unsetHold()
    this.buttons.delete(index)
    clearTimeout(this.holdTimer)
    this.upHandler()
  }

  cleanup() {
    clearTimeout(this.holdTimer)
    this.buttons.clear()
    this.clearActivity()
  }

  setup() {
    this.buttons = new Set()

    const events = computed(() => {
      return this.buttonActions.value?.getHandlers(this.actions)
    })
    const cleanupActions = computed(() => {
      return this.buttonActions.value?.ensureHandler(this.actions)
    })

    const helpers = useButton(events, cleanupActions)
    Object.entries(helpers).forEach(([name, method]) => {
      this[name] = method
    })
  }
}
