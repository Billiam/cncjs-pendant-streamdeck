import { useCncStore } from '@/stores/cnc'

export const useRunGcode = (socket, port) => {
  const cnc = useCncStore()

  const command = (...args) => {
    socket.emit('command', port.value, ...args)
  }

  const runGcode = (...args) => {
    command('gcode', ...args)
  }

  const withRelative = (callback) => {
    const wasRelative = cnc.isRelativeMove

    runGcode('G91')
    callback()

    if (!wasRelative) {
      runGcode('G90')
    }
  }

  const withAbsolute = (callback) => {
    const wasRelative = cnc.isRelativeMove

    runGcode('G90')
    callback()

    if (wasRelative) {
      runGcode('G91')
    }
  }

  return {
    runGcode,
    withAbsolute,
    withRelative,
  }
}
