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

export const useCncStore = defineStore({
  id: 'cnc',
  state: () => ({
    connected: false,
    runState: cncStates.IDLE,
    locked: false,

    alarmReason: '',
    holdReason: '',

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

    setHold(reason = '') {
      this.runState = cncStates.HOLD
      this.holdholdReason = reason
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
    alarm: (state) => state.runState === cncStates.ALARM,
    alarmText: (state) =>
      `${['Alarm', state.alarmReason, state.locked ? 'Locked' : null]
        .filter(Boolean)
        .join('\n')}`,
    accelerations: (state) => {
      if (!state.settings) {
        return
      }
      return axisOrder
        .map((axis) => {
          return state.settings[`$${axisOrder.indexOf(axis) + 121}`]
        })
        .filter((x) => x != null)
    },
    ready: (state) =>
      state.connected &&
      (state.runState === cncStates.IDLE || state.runState === cncStates.JOG),
  },
})
