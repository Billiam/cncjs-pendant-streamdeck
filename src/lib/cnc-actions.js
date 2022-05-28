import actionBus from '@/services/action-bus'
import ackBus from '@/services/ack-bus'
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'

export default (socket, options) => {
  const ui = useUiStore()
  const cnc = useCncStore()

  const { port } = options

  const command = (...args) => {
    socket.emit('command', port, ...args)
  }
  const gcode = (...args) => {
    command('gcode', ...args)
  }

  const withRelative = (callback) => {
    if (ui.isRelativeMove) {
      callback()
    } else {
      gcode('G91')
      callback()
      gcode('G90')
    }
  }

  const withAbsolute = (callback) => {
    if (ui.isRelativeMove) {
      gcode('G90')
      callback()
      gcode('G91')
    } else {
      callback()
    }
  }

  const jog = (direction, axis) => {
    const distance = cnc.jogDistance
    const signedDistance = direction === '-' ? -distance : distance

    withRelative(() => {
      gcode(`G0 ${axis}${signedDistance}`)
    })
  }

  const smoothJogFrequency = 150
  const jogState = {
    timer: null,
    speed: null,
    axes: {},
    jogging: false,
  }

  const promiseTimer = (delay) => {
    return new Promise((resolve) => {
      setTimeout(resolve, delay)
    })
  }

  const getAxisComponents = (speeds, magnitude) => {
    // calculate incremental distances for multiaxis movement
    // TODO: consider minimum acceleration, direction changes

    //may be simpler to map axes without distance and then apply magnitude multiplier later
    const active = speeds
      .map(([key, value]) => {
        return value !== 0 && [key, value]
      })
      .filter(Boolean)

    const [baseKey, baseVal] = active[0]
    if (active.length === 1) {
      console.debug('Single axis', baseKey, baseVal * magnitude)
    }

    const ratioSquareSum =
      active.reduce((total, [, val]) => total + val ** 2, 0) / baseVal ** 2
    const baseDistance = Math.sqrt(magnitude ** 2 / ratioSquareSum)

    return active.map(([key, speed]) => {
      return [key, speed * baseDistance]
    }, {})
  }

  const promiseAck = () => {
    return new Promise((resolve) => {
      ackBus.once('ok', resolve)
    })
  }

  const smoothJogReady = (delay) => {
    return Promise.all([promiseTimer(delay), promiseAck()])
  }

  // todo: make configurable
  const axisSpeeds = {
    x: 1,
    y: 1,
    z: 0.25,
    a: 1,
    b: 1,
    c: 1,
  }

  const smoothJogIteration = async ({ reducedDelay = false }) => {
    if (!jogState.jogging) {
      return
    }
    clearTimeout(jogState.cancelTimer)

    const activeAxes = Object.entries(jogState.axes)
    if (activeAxes.length === 0) {
      clearSmoothJog()
      return
    }
    const jogIncrementDistance = jogState.speed * (smoothJogFrequency / 60000)
    const axisDistances = getAxisComponents(activeAxes, jogIncrementDistance)
    const jogAxes = axisDistances
      .map(([axis, distance]) => `${axis}${distance}`)
      .join(' ')

    if (!jogAxes) {
      clearSmoothJog()
      return
    }
    const throttledSpeed =
      jogState.speed * Math.max(...activeAxes.map(([, val]) => Math.abs(val)))
    const jogGcode = `$J=G91 ${jogAxes} F${throttledSpeed}`
    jogState.ack = false
    gcode(jogGcode)

    jogState.cancelTimer = setTimeout(smoothJogTimeout, 1000)
    // slightly reduce the delay for first request to ensure jog overlap
    const delay = smoothJogFrequency - (reducedDelay ? 50 : 0)
    smoothJogReady(delay).then(smoothJogIteration)
  }

  const smoothJogTimeout = () => {
    clearSmoothJog()
  }

  const smoothJog = (direction, axis) => {
    const directionModifier = direction === '-' ? -1 : 1

    // TODO: speed modifier from config
    const speedModifier = axisSpeeds[axis]
    const v = directionModifier * speedModifier

    if (jogState.axes[axis] != null) {
      if (v !== jogState.axes[axis]) {
        delete jogState.axes[axis]
      }
      // may need to stop jogging here
      return
    }

    jogState.axes[axis] = v
    jogState.speed = cnc.jogSpeed

    if (!jogState.jogging) {
      jogState.jogging = true
      smoothJogIteration({ reducedDelay: true })
    }
  }

  const clearSmoothJog = () => {
    jogState.jogging = false
    jogState.speed = 0
  }

  const stopSmoothJog = (axis) => {
    // console.log('Stop requested')
    delete jogState.axes[axis]
    if (Object.keys(jogState.axes).length === 0) {
      clearSmoothJog()
    }
  }

  // todo: separate service to bind bus to actions
  actionBus.on('jog', ({ direction, axis }) => {
    jog(direction, axis)
  })

  actionBus.on('smoothJog', ({ direction, axis }) => {
    smoothJog(direction, axis)
  })

  actionBus.on('stopSmoothJog', ({ direction, axis }) => {
    stopSmoothJog(axis)
  })

  actionBus.on('gcode', (code) => {
    gcode(code)
  })

  return {
    jog,
  }
}
