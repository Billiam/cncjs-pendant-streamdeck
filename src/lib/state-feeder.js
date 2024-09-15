import { GcodeWorker, onWorkerEvent, offWorkerEvent } from 'adapter'
import { useGcodeStore } from '@/stores/gcode'
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'

const gcodeWorker = GcodeWorker()

export default (socket, ackBus) => {
  const cnc = useCncStore()
  const ui = useUiStore()
  const gcode = useGcodeStore()

  const listeners = {
    'Grbl:state': (data) => {
      const { wpos, mpos, ov, spindle, feedrate } = data.status
      const { modal } = data.parserstate
      cnc.setOverrides(...ov)
      cnc.setWpos(wpos)
      cnc.setMpos(mpos)
      cnc.setModal(modal)
      cnc.setFeedrate(feedrate)
      cnc.setSpindleRpm(spindle)
      cnc.setRunState(data.status.activeState)
    },

    'serialport:read': (data) => {
      switch (true) {
        case data === 'ok':
        case data.startsWith('error:15'):
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
      cnc.setConnected(true)
    },
    'Grbl:settings': ({ parameters, settings, version }) => {
      cnc.setSettings(settings)
      cnc.setVersion(version)
    },
    'gcode:load': (file, code) => {
      gcodeWorker.postMessage({ name: file, gcode: code, limit: ui.gcodeLimit })
      gcode.setLoaded(file, code)
    },
    'gcode:unload': () => {
      gcode.unload()
    },
    'sender:status': (status) => {
      cnc.setElapsedTime(status.elapsedTime * 0.001)
      cnc.setRemainingTime(status.remainingTime * 0.001)

      if (!status.hold) {
        return
      }
      let data, msg, err
      if (status.holdReason) {
        ;({ data, msg, err } = status.holdReason)
      }
      cnc.setPause(data, msg)
      if (err) {
        cnc.setError(msg)
      }
    },
    'task:finish': (task, code) => {
      cnc.clearActiveCommand(task)
    },
    'feeder:status': (status) => {
      if (!status.hold) {
        cnc.clearFeedHold()
        return
      }
      let data, msg, err
      if (status.holdReason) {
        ;({ data, msg, err } = status.holdReason)
      }
      cnc.setFeedHold(data, msg)
      if (err) {
        console.error(err)
      }
    },
    'workflow:state': (status) => {
      cnc.setWorkflowState(status)
    },
    connect_error: () => {
      if (cnc.connected) {
        cnc.setConnected(false)
      }
    },
    connect: () => {
      cnc.clearActiveCommands()
    },
  }
  const workerListeners = {
    message: (e) => {
      const { name, geometry } = e.data
      if (gcode.name === name) {
        gcode.setGeometry(geometry)
      }
    },
  }

  Object.entries(listeners).forEach(([event, listener]) => {
    socket.on(event, listener)
  })
  Object.entries(workerListeners).forEach(([event, listener]) => {
    onWorkerEvent(gcodeWorker, event, listener)
  })

  const destroy = () => {
    Object.entries(listeners).forEach(([event, listener]) => {
      socket.off(event, listener)
    })
    Object.entries(workerListeners).forEach(([event, listener]) => {
      offWorkerEvent(gcodeWorker, event, listener)
    })
  }

  return {
    destroy,
  }
}
