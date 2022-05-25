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

  const swapScene = (cfg) => {
    store.ui.swapScene(cfg.arguments[0])
  }

  const jog = (cfg) => {
    const [direction, axis] = cfg.arguments
    actionBus.emit('jog', { direction, axis })
  }

  const jogDistance = (cfg) => {
    if (cfg.arguments[0] === '-') {
      store.cnc.decreaseJogDistance()
    } else {
      store.cnc.increaseJogDistance()
    }
  }

  const jogSpeed = (cfg) => {
    if (cfg.arguments[0] === '-') {
      store.cnc.decreaseJogSpeed()
    } else {
      store.cnc.increaseJogSpeed()
    }
  }

  const navigate = (cfg) => {
    store.ui.goToScene(cfg.arguments[0])
  }

  const smoothJog = (cfg) => {
    const [direction, axis] = cfg.arguments
    actionBus.emit('smoothJog', { direction, axis })
  }

  const stopSmoothJog = (cfg) => {
    const [direction, axis] = cfg.arguments
    actionBus.emit('stopSmoothJog', { direction, axis })
  }

  const gcode = (cfg) => {
    actionBus.emit('gcode', cfg.arguments[0])
  }
  const fullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  const clickMap = {
    backScene,
    jog,
    jogDistance,
    jogSpeed,
    navigate,
    swapScene,
    gcode,
    fullscreen,
  }
  const downMap = {
    smoothJog,
  }
  const upMap = {
    smoothJog: stopSmoothJog,
  }

  const fetchHandler = (map, cfg) => {
    const action = map[cfg?.action]
    if (action) {
      return () => action(cfg)
    }
  }

  return {
    clickHandler: (cfg) => fetchHandler(clickMap, cfg),
    downHandler: (cfg) => fetchHandler(downMap, cfg),
    upHandler: (cfg) => fetchHandler(upMap, cfg),
  }
}
