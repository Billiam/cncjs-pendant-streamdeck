import { useFileListStore } from '@/stores/file-list'
import { useUiStore } from '@/stores/ui'
import { useCncStore } from '@/stores/cnc'
import { useGcodeStore } from '@/stores/gcode'

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
    get fileList() {
      delete this.fileList
      return (this.fileList = useFileListStore())
    },
    get gcode() {
      delete this.gcode
      return (this.gcode = useGcodeStore())
    },
  }
}
const machineCommands = new Set([
  'enterPosition',
  'enterWcs',
  'gcode',
  'homing',
  'jog',
  'macro',
  'play',
  'startSmoothJog',
  'stopSmoothJog',
])

// commands that can be run after reset
const alarmCommands = new Set(['homing', 'unlock'])

// map configuration to actions
export default (actionBus) => {
  const store = lazyStore()

  const backScene = (count = 1) => {
    store.ui.goBack(count)
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

  const run = () => {
    if (store.cnc.idle) {
      command('gcode:start')
      return
    }
    if (store.cnc.paused) {
      command('gcode:resume')
    }
  }

  const pause = () => {
    if (store.cnc.running) {
      command('gcode:pause')
    }
  }

  const stop = () => {
    if (store.cnc.paused) {
      command('gcode:stop', { force: true })
    }
  }

  const clearGcode = () => {
    if (store.cnc.idle && store.gcode.gcode) {
      command('gcode:unload', 'cake')
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
  const command = (cmd, ...args) => {
    actionBus.emit('command', { command: cmd, args: args })
  }
  const reset = () => {
    command('reset')
  }

  const homing = () => {
    command('homing')
  }
  const unlock = () => {
    command('unlock')
  }
  const hold = () => {
    command('feedhold')
  }
  const unhold = () => {
    command('cyclestart')
  }
  const fullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }
  const toggleShowAbsolutePosition = () => {
    store.ui.toggleShowAbsolutePosition()
  }

  const fileDetails = (path, file) => {
    store.ui.fileDetailsPath = path
    store.ui.fileDetails = file

    navigate('fileDetails')
  }

  const previousFolder = () => {
    store.fileList.previousFolder()
  }

  const loadFolder = (path) => {
    store.fileList.loadFolder(path)
  }

  const refreshWatchFolder = async () => {
    await store.fileList.loadFiles()
    navigate('gcodeList')
  }

  const loadFile = (path) => {
    command('watchdir:load', path)
  }
  const loadDetailFile = () => {
    if (!store.ui.fileDetailsPath) {
      return
    }
    loadFile(store.ui.fileDetailsPath)
  }
  const fileListScrollUp = () => {
    store.fileList.scrollUp()
  }

  const fileListScrollDown = () => {
    store.fileList.scrollDown()
  }

  const sortDetails = (sort) => {
    store.ui.fileDetailsSort = sort
  }

  const goto = (x, y, z, a, b, c) => {
    const limits = store.cnc.axisLimits

    const move = Object.entries({ x, y, z, a, b, c })
      .map(([axis, position]) => {
        if (position?.endsWith('%')) {
          if (limits[axis]) {
            const absPosition = parseFloat(position) * -0.01 * limits[axis]
            return `${axis}${absPosition.toFixed(5)}`
          }
        } else if (position) {
          return `${axis}${position}`
        }
      })
      .filter(Boolean)
      .join(' ')

    actionBus.emit('absolutePosition', move)
  }
  const actionTypes = {}

  const actions = {
    backScene,
    clearGcode,
    completeInput,
    enterPosition,
    enterWcs,
    fileDetails,
    loadDetailFile,
    fileListScrollDown,
    fileListScrollUp,
    fullscreen,
    gcode,
    goto,
    hold,
    homing,
    input,
    inputCommand,
    jog,
    jogDistance,
    jogSpeed,
    loadFile,
    loadFolder,
    navigate,
    pause,
    previousFolder,
    refreshWatchFolder,
    reset,
    run,
    sortDetails,
    startSmoothJog,
    stop,
    stopSmoothJog,
    swapScene,
    toggleShowAbsolutePosition,
    unhold,
    unlock,
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
  const getCallback = (cfg) => {
    return cfg.action && actions[cfg.action]
  }

  const getHandlers = (cfg) => {
    if (!cfg) {
      return {}
    }
    return cfg.reduce((grouped, action) => {
      const callback = getCallback(action)
      if (!callback) {
        return grouped
      }
      const event = action.event ?? 'down'
      grouped[event] ??= []
      grouped[event].push({
        action: callback,
        type: actionTypes[action.action],
        arguments: action.arguments,
      })
      return grouped
    }, {})
  }
  return {
    getHandlers,
    ensureHandler,
    enabled,
  }
}
