import actionBus from '@/services/action-bus'
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

  const smoothJogFrequency = 200
  const jogState = {
    timer: null,
    speed: null,
    axes: {},
  }

  const smoothJogIteration = () => {
    if (!jogState.speed) {
      return
    }

    const distance = jogState.speed * (smoothJogFrequency / 60000)
    const jogAxes = Object.entries(jogState.axes)
      .map(([axis, direction]) => {
        const signedDistance = +(direction * distance).toFixed(6)
        return `${axis}${signedDistance}`
      })
      .join(' ')

    if (!jogAxes) {
      clearSmoothJog()
      return
    }

    const jogGcode = `$J=G91 ${jogAxes} F${jogState.speed}`
    gcode(jogGcode)
    jogState.timer = setTimeout(smoothJogIteration, smoothJogFrequency)
  }

  const smoothJog = (direction, axis) => {
    const directionModifier = direction === '-' ? -1 : 1

    // TODO: speed modifier from config
    const speedModifier = axis === 'z' ? 0.25 : 1
    const v = directionModifier * speedModifier

    if (jogState.axes[axis] != null) {
      console.log({ exists: jogState, axis })
      if (v !== jogState.axes[axis]) {
        delete jogState.axes[axis]
      }
      // may need to stop jogging here
      return
    }
    jogState.axes[axis] = v
    jogState.speed = cnc.jogSpeed

    if (jogState.timer == null) {
      smoothJogIteration()
    } else {
      console.log('skipping timer')
    }
  }

  const clearSmoothJog = () => {
    clearTimeout(jogState.timer)
    jogState.timer = null
    jogState.speed = 0
  }

  const stopSmoothJog = (axis) => {
    delete jogState.axes[axis]
    if (Object.keys(jogState.axes).length === 0) {
      clearSmoothJog()
    }
    console.log('Stopped jogging', { jogState })
  }

  // todo: separate service to bind bus to actions
  actionBus.on('jog', ({ direction, axis }) => {
    jog(direction, axis)
  })

  actionBus.on('smoothJog', ({ direction, axis }) => {
    console.log('smoothJog on')
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
