import { defineStore } from 'pinia'
// TODO: Take speeds and distances from config
const jogDistances = {
  mm: [0.01, 0.1, 1, 10, 20, 50, 100],
  in: [0.001, 0.01, 0.1, 1, 5, 10, 20],
}
const jogSpeeds = {
  mm: [500, 2500, 5000],
  in: [15, 75, 150],
}

const changeListPosition = (item, list, fallback, offset = 1) => {
  const index = list.indexOf(item)
  if (index === -1) {
    return fallback
  }
  return list[Math.min(list.length - 1, Math.max(0, index + offset))]
}
const listIncrease = (item, list, fallback) =>
  changeListPosition(item, list, fallback, 1)

const listDecrease = (item, list, fallback) =>
  changeListPosition(item, list, fallback, -1)

const axisOrder = ['x', 'y', 'z', 'a', 'b', 'c']

export const cncStates = {
  IDLE: 'Idle',
  HOLD: 'Hold',
  ALARM: 'Alarm',
  JOG: 'Jog',
  RUNNING: 'Run',
}
export const workflowStates = {
  IDLE: 'idle',
  PAUSE: 'paused',
  RUNNING: 'running',
}

export const useCncStore = defineStore({
  id: 'cnc',
  state: () => ({
    connected: false,
    token: null,
    runState: cncStates.IDLE,
    workflowState: workflowStates.IDLE,
    locked: false,

    alarmReason: '',
    pauseReason: '',
    pauseMessage: '',
    errorMessage: '',

    jogDistance: 1,
    jogSpeed: 500,
    settings: {},

    wpos: {
      x: '0.000',
      y: '0.000',
      z: '0.000',
      a: '0.000',
      b: '0.000',
      c: '0.000',
    },
    mpos: {
      x: '0.000',
      y: '0.000',
      z: '0.000',
      a: '0.000',
      b: '0.000',
      c: '0.000',
    },
    modal: {
      distance: 'G90',
      units: 'G21',
      wcs: 'G54',
    },
  }),

  actions: {
    setConnected(connected) {
      this.connected = connected
      if (!connected) {
        this.$reset()
      }
    },
    setToken(token) {
      this.token = token
    },
    setRunState(state) {
      if (Object.values(cncStates).includes(state)) {
        this.runState = state
        if (state !== cncStates.ALARM) {
          this.locked = false
        }
      } else {
        console.error('Unrecognized state', state)
      }
    },
    setWorkflowState(state) {
      if (Object.values(workflowStates).includes(state)) {
        this.workflowState = state
        if (state !== workflowStates.PAUSE) {
          this.clearPause()
          this.clearError()
        }
      } else {
        console.error('Unrecognized state', state)
      }
    },
    setVersion(version) {
      this.version = version
    },

    setSettings(settings) {
      this.settings = settings
    },

    increaseJogDistance() {
      this.jogDistance = listIncrease(this.jogDistance, this.distances, 1)
    },

    decreaseJogDistance() {
      this.jogDistance = listDecrease(this.jogDistance, this.distances, 1)
    },

    increaseJogSpeed() {
      this.jogSpeed = listIncrease(
        this.jogSpeed,
        this.speeds,
        this.speedFallback
      )
    },

    decreaseJogSpeed() {
      this.jogSpeed = listDecrease(
        this.jogSpeed,
        this.speeds,
        this.speedFallback
      )
    },
    setError(error) {
      this.errorMessage = error
    },
    clearError(error) {
      this.errorMessage = null
    },
    setPause(reason, message) {
      this.workflowState = workflowStates.PAUSE
      this.pauseReason = reason
      this.pauseMessage = message
    },
    clearPause() {
      this.pauseReason = null
      this.pauseMessage = null
    },
    setAlarm(reason = '') {
      this.runState = cncStates.ALARM
      this.alarmReason = reason
    },
    setLocked(val = true) {
      this.locked = val
    },
    setModal(modal) {
      const changed = this.modal.units !== modal.units

      this.modal = Object.freeze(modal)
      if (changed) {
        this.jogDistance = 1
        this.jogSpeed = this.speedFallback
      }
    },
    setMpos(mpos) {
      this.mpos = Object.freeze(mpos)
    },
    setWpos(wpos) {
      this.wpos = Object.freeze(wpos)
    },
  },
  getters: {
    isRelativeMove: (state) => state.modal.distance === 'G91',
    distanceUnit: (state) => (state.modal.units === 'G21' ? 'mm' : 'in'),
    distances: (state) => jogDistances[state.distanceUnit],
    speeds: (state) => jogSpeeds[state.distanceUnit],
    speedFallback: (state) => (state.distanceUnit === 'mm' ? 500 : 75),
    hold: (state) => state.runState === cncStates.HOLD,
    paused: (state) => state.workflowState === workflowStates.PAUSE,
    idle: (state) => state.workflowState === workflowStates.IDLE,
    running: (state) => state.workflowState === workflowStates.RUNNING,
    alarm: (state) => state.runState === cncStates.ALARM,
    alarmText: (state) =>
      `${['Alarm', state.alarmReason, state.locked ? 'Locked' : null]
        .filter(Boolean)
        .join('\n')}`,
    pauseText: (state) => {
      if (state.pauseReason !== 'M6') {
        return
      }
      const messages = ['Tool change']
      if (state.pauseMessage && state.pauseMessage !== 'M6') {
        messages.push(state.pauseMessage.replace(/^M6 \((.*)\)$/, '$1'))
      }
      return messages.join('\n')
    },
    accelerations: (state) => {
      if (!state.settings) {
        return
      }
      return axisOrder
        .map((axis, i) => {
          return state.settings[`$${i + 121}`]
        })
        .filter((x) => x != null)
    },
    axisLimits: (state) => {
      if (!state.settings) {
        return {}
      }
      return axisOrder.reduce((limits, axis, i) => {
        limits[axis] = state.settings[`$${i + 130}`]
        return limits
      }, {})
    },

    ready: (state) =>
      state.connected &&
      (state.runState === cncStates.IDLE || state.runState === cncStates.JOG),
  },
})
