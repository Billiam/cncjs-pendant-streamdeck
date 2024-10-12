import { storeToRefs } from 'pinia'

import { useRunGcode } from '@/lib/run-gcode'
import { useCncStore } from '@/stores/cnc'
import { useConnectionStore } from '@/stores/connection'
import { useUiStore } from '@/stores/ui'

export default (socket, actionBus, ackBus) => {
  const cnc = useCncStore()
  const ui = useUiStore()
  const connection = useConnectionStore()

  const { axisSpeeds } = storeToRefs(cnc)
  const { port } = storeToRefs(connection)

  const { runGcode, withRelative, withAbsolute } = useRunGcode(socket, port)

  const command = (...args) => {
    socket.emit('command', port.value, ...args)
  }

  const jog = (direction, axis) => {
    const distance = cnc.jogDistance
    const signedDistance = direction === '-' ? -distance : distance
    withRelative(() => {
      runGcode(`G0 ${axis}${signedDistance}`)
    })
  }

  const smoothJogFrequency = ui.web ? 150 : 50
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
      active.map(([, value]) => value ** 2).reduce((sum, val) => sum + val, 0),
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
    runGcode(jogGcode)

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

    const speedModifier = axisSpeeds.value?.[axis] ?? 1
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
    runGcode(code)
  })

  actionBus.on('absoluteWorkPosition', (code) => {
    withAbsolute(() => runGcode(`G0 ${code}`))
  })

  actionBus.on('command', (evt) => {
    command(evt.command, ...(evt.args || []))
  })

  actionBus.on('machinePosition', (evt) => {
    if (!evt) {
      return
    }

    runGcode(`G53 G0 ${evt}`)
  })

  return {}
}
