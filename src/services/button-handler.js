import { useUiStore } from '@/stores/ui'
import { useCncStore } from '@/stores/cnc'

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
const machineCommands = new Set([
  'startSmoothJog',
  'stopSmoothJog',
  'gcode',
  'jog',
  'enterWcs',
  'enterPosition',
])

// commands that can be run after reset
const alarmCommands = new Set(['home', 'unlock'])

// map configuration to actions
export default (actionBus) => {
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

  const enterWcs = (axis, scene = 'numpad') => {
    const label = `${store.cnc.modal.wcs} ${axis.toUpperCase()} offset`
    store.ui.startInput(store.cnc.wpos[axis], label, scene, (result) => {
      gcode(`G10 L20 P1 ${axis}${result}`)
    })
  }

  const enterPosition = (axis, scene = 'numpad') => {
    const label = `Go to ${store.cnc.modal.wcs} ${axis.toUpperCase()}`
    store.ui.startInput(store.cnc.wpos[axis], label, scene, (result) => {
      gcode(`G0 ${axis}${result}`)
    })
  }
  const completeInput = () => {
    store.ui.completeInput()
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
  const command = (cmd) => {
    actionBus.emit('command', cmd)
  }
  const reset = () => {
    command('reset')
  }

  const home = () => {
    command('homing')
  }
  const unlock = () => {
    command('unlock')
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
    reset,
    home,
    unlock,

    fullscreen,
    navigate,
    swapScene,
    backScene,
    completeInput,
  }

  const ensureHandler = (cfg) => {
    if (!cfg) {
      return
    }
    const smoothJog = cfg.filter((action) => {
      return action?.action === 'startSmoothJog'
    })
    if (smoothJog.length > 0) {
      return smoothJog.map((action) => {
        return {
          action: stopSmoothJog,
          arguments: action.arguments,
        }
      })
    }
  }

  const enabled = (cfg) => {
    return (
      store.cnc.ready ||
      !cfg?.every((action) => machineCommands.has(action.action)) ||
      (store.cnc.alarm &&
        cfg.some((action) => alarmCommands.has(action.action)))
    )
  }

  const getHandlers = (cfg) => {
    if (!cfg) {
      return {}
    }

    return cfg.reduce((grouped, action) => {
      if (action.action) {
        const callback = actions[action.action]
        if (action) {
          const event = action.event ?? 'down'
          grouped[event] ??= []
          grouped[event].push({
            action: callback,
            arguments: action.arguments,
          })
        }
      }
      return grouped
    }, {})
  }
  return {
    getHandlers,
    ensureHandler,
    enabled,
  }
}
