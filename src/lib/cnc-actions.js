import { useCncStore } from '@/stores/cnc'

export default (socket, port, machineConfig, actionBus, ackBus) => {
  const cnc = useCncStore()
  const axisSpeeds = machineConfig?.axisSpeeds || {}

  const command = (...args) => {
    socket.emit('command', port, ...args)
  }
  const gcode = (...args) => {
    command('gcode', ...args)
  }

  const withRelative = (callback) => {
    const wasRelative = cnc.isRelativeMove

    gcode('G91')
    callback()

    if (!wasRelative) {
      gcode('G90')
    }
  }

  const withAbsolute = (callback) => {
    const wasRelative = cnc.isRelativeMove

    gcode('G90')
    callback()

    if (wasRelative) {
      gcode('G91')
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
    // TODO: consider minimum acceleration, direction changes

    const active = speeds
      .map(([key, value]) => {
        return value !== 0 && [key, value]
      })
      .filter(Boolean)

    // D = sqrt(x^2+y^2+z^2)
    // X = speed * direction * multiplier
    // Math.sqrt(x^2+y^2+z^2...)
    const diagonalComponent = Math.sqrt(
      active.map(([, value]) => value ** 2).reduce((sum, val) => sum + val, 0)
    )
    // X = (500 * -1 * 1)/D
    return active.map(([key, direction]) => {
      return [key, (direction * magnitude) / diagonalComponent]
    })
  }

  const promiseAck = () => {
    return new Promise((resolve) => {
      ackBus.once('ok', resolve)
    })
  }

  const smoothJogReady = (delay) => {
    return Promise.all([promiseTimer(delay), promiseAck()])
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
    const throttledSpeed =
      jogState.speed * Math.max(...activeAxes.map(([, val]) => Math.abs(val)))
    const jogIncrementDistance = throttledSpeed * (smoothJogFrequency / 60000)
    const axisDistances = getAxisComponents(activeAxes, jogIncrementDistance)

    const jogAxes = axisDistances
      .map(([axis, distance]) => `${axis}${distance}`)
      .join(' ')

    if (!jogAxes) {
      clearSmoothJog()
      return
    }

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

    const speedModifier = axisSpeeds?.[axis] ?? 1
    const v = directionModifier * speedModifier

    if (jogState.axes[axis] != null) {
      if (v !== jogState.axes[axis]) {
        delete jogState.axes[axis]
      }
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

  actionBus.on('stopSmoothJog', ({ axis }) => {
    stopSmoothJog(axis)
  })

  actionBus.on('gcode', (code) => {
    gcode(code)
  })

  actionBus.on('command', (evt) => {
    command(evt.command, ...(evt.args || []))
  })

  actionBus.on('absolutePosition', (evt) => {
    if (!evt) {
      return
    }

    gcode(`G53 G0 ${evt}`)
  })

  return {}
}
