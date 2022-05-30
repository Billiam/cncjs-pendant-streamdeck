import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import actionBus from '@/services/action-bus'

const lazyStore = () => {
  return {
    get ui() {
      delete this.ui
      return (this.ui = useUiStore())
    },
    get cnc() {
      delete this.cnc
      return (this.cnc = useCncStore())
    },
  }
}

// map configuration to actions
export default () => {
  const store = lazyStore()

  const backScene = () => {
    store.ui.goBack()
  }

  const swapScene = (scene) => {
    store.ui.swapScene(scene)
  }

  const navigate = (scene) => {
    store.ui.goToScene(scene)
  }

  const enterWcs = (axis) => {
    const label = `${store.cnc.modal.wcs} ${axis.toUpperCase()} offset`
    store.ui.startInput(store.cnc.wpos[axis], label)
    store.ui.goToScene('numpad')
  }

  const enterPosition = (axis) => {
    const label = `Go to ${store.cnc.modal.wcs} ${axis.toUpperCase()}`
    store.ui.startInput(store.cnc.wpos[axis], label)
    store.ui.goToScene('numpad')
  }

  const input = (chars) => {
    store.ui.addInput(chars)
  }

  const inputCommand = (command) => {
    const input = store.ui.input
    if (command === 'backspace') {
      input.value = input.value.slice(0, -1)
    } else if (command === 'toggleSign') {
      input.value = input.value.startsWith('-')
        ? input.value.slice(1)
        : '-' + input.value
    }
  }

  const jog = (direction, axis) => {
    actionBus.emit('jog', { direction, axis })
  }

  const jogDistance = (sign) => {
    if (sign === '-') {
      store.cnc.decreaseJogDistance()
    } else {
      store.cnc.increaseJogDistance()
    }
  }

  const jogSpeed = (sign) => {
    if (sign === '-') {
      store.cnc.decreaseJogSpeed()
    } else {
      store.cnc.increaseJogSpeed()
    }
  }

  const startSmoothJog = (direction, axis) => {
    actionBus.emit('smoothJog', { direction, axis })
  }

  const stopSmoothJog = (direction, axis) => {
    actionBus.emit('stopSmoothJog', { direction, axis })
  }

  const gcode = (code) => {
    actionBus.emit('gcode', code)
  }
  const fullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }
  const actions = {
    startSmoothJog,
    stopSmoothJog,
    gcode,
    input,
    inputCommand,
    jog,
    jogDistance,
    jogSpeed,
    enterWcs,
    enterPosition,

    fullscreen,
    navigate,
    swapScene,
    backScene,
  }

  const ensureHandler = (cfg) => {
    if (!cfg.actions) {
      return
    }
    const isSmoothJog = cfg.actions.find((el) => {
      return el?.action === 'startSmoothJog'
    })
    if (isSmoothJog) {
      return stopSmoothJog
    }
  }

  const getHandlers = (cfg) => {
    if (!cfg.actions) {
      return {}
    }

    return cfg.actions.reduce((grouped, element) => {
      if (element.action) {
        const action = actions[element.action]
        if (action) {
          const event = element.event ?? 'down'
          grouped[event] ??= []
          grouped[event].push({
            action,
            arguments: element.arguments,
          })
        }
      }
      return grouped
    }, {})
  }
  return {
    getHandlers,
    ensureHandler: (cfg) => ensureHandler(cfg),
  }
}
