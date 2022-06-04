import { useCncStore } from '@/stores/cnc'
export default (socket, ackBus) => {
  const cnc = useCncStore()
  const listeners = {
    'Grbl:state': (data) => {
      const { wpos, mpos } = data.status
      const { modal } = data.parserstate

      cnc.setWpos(wpos)
      cnc.setMpos(mpos)
      cnc.setModal(modal)
      cnc.setRunState(data.status.activeState)
    },

    'serialport:read': (data) => {
      switch (true) {
        case data === 'ok':
          ackBus.emit('ok')
          break
        case data.startsWith('ALARM:'):
          cnc.setAlarm(data.substring(6))
          break
        case data.includes("'$X' to unlock"):
          cnc.setLocked()
          break
        case data.includes('Unlocked'):
          cnc.setLocked(false)
      }
    },
    'serialport:change': ({ inuse }) => {
      cnc.setConnected(inuse)
    },
    'serialport:open': () => {
      console.log('connected')
      cnc.setConnected(true)
    },
  }

  Object.entries(listeners).forEach(([event, listener]) => {
    socket.on(event, listener)
  })

  const destroy = () => {
    Object.entries(listeners).forEach(([event, listener]) => {
      socket.off(event, listener)
    })
  }

  return {
    destroy,
  }
}
