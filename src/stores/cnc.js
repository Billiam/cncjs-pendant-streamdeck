import { defineStore } from 'pinia'

// TODO: Take speeds and distances from config
const jogDistances = {
  mm: [0.001, 0.01, 0.1, 1, 10, 20, 50, 100],
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
  HOMING: 'Home',
}
export const workflowStates = {
  IDLE: 'idle',
  PAUSE: 'paused',
  RUNNING: 'running',
}
export const feederStates = {
  IDLE: 'idle',
  PAUSE: 'paused',
}

const formatDuration = (seconds) => {
  return new Date(seconds * 1000).toISOString().substring(11, 19)
}
const formatAxes = (position, axes) =>
  axes
    .map((axis) => {
      return `${axis.toUpperCase()}:${position[axis].padStart(8, ' ')}`
    })
    .join('\n')

const pauseText = (reason, message) => {
  if (reason === 'M0' || reason === 'M1') {
    return message
  }

  if (reason !== 'M6') {
    return
  }
  const messages = ['Tool change']
  if (message && message !== 'M6') {
    messages.push(message.replace(/^M6 \((.*)\)$/, '$1'))
  }
  return messages.join('\n')
}

export const useCncStore = defineStore({
  id: 'cnc',
  state: () => ({
    connected: false,
    connecting: false,
    socketConnected: false,
    configMissing: false,
    token: null,
    runState: cncStates.IDLE,
    workflowState: workflowStates.IDLE,
    feederState: feederStates.IDLE,
    locked: false,
    _client: null,
    macros: null,
    commands: null,
    elapsedTime: null,
    remainingTime: null,

    alarmReason: '',
    pauseReason: '',
    pauseMessage: '',
    errorMessage: '',

    feedPauseReason: '',
    feedPauseMessage: '',

    jogDistance: 1,
    jogSpeed: 500,
    settings: {},
    overrides: {
      feed: 100,
      spindle: 100,
      rapid: 100,
    },
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
    axes: ['x', 'y', 'z'],
    axisSpeeds: {},

    spindleRpm: 0,
    feedRate: 0,

    _activeCommands: {},
    _activeWorkers: {},
  }),

  actions: {
    setClient(client) {
      this._client = client
    },
    setConnected(connected) {
      this.connected = connected
      this.connecting = false
    },
    setConnecting(connecting = true) {
      this.connecting = connecting
    },
    setSocketConnected(connected) {
      this.socketConnected = connected
    },
    setToken(token) {
      this.token = token
    },
    setElapsedTime(time) {
      this.elapsedTime = time
    },
    setRemainingTime(time) {
      this.remainingTime = time
    },
    setRunState(state) {
      if (Object.values(cncStates).includes(state)) {
        this.runState = state
        if (state !== cncStates.ALARM) {
          this.locked = false
        }
      } else if (state) {
        console.error('Unrecognized run state', state)
      }
    },
    setWorkflowState(state) {
      if (Object.values(workflowStates).includes(state)) {
        this.workflowState = state
        if (state !== workflowStates.PAUSE) {
          this.clearPause()
          this.clearError()
        }
      } else if (state) {
        console.error('Unrecognized workflow state', state)
      }
    },
    setFeedHold(data, message) {
      this.feederState = feederStates.PAUSE
      this.feedPauseReason = data
      this.feedPauseMessage = message
    },
    clearFeedHold() {
      this.feederState = feederStates.IDLE
      this.feedPauseReason = null
      this.feedPauseMessage = null
    },
    setAxes(axes) {
      if (axes) {
        this.axes = axes
      }
    },
    setAxisSpeeds(speeds) {
      if (speeds) {
        this.axisSpeeds = speeds
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
        this.speedFallback,
      )
    },

    decreaseJogSpeed() {
      this.jogSpeed = listDecrease(
        this.jogSpeed,
        this.speeds,
        this.speedFallback,
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
    setSpindleRpm(val = 0) {
      this.spindleRpm = parseInt(val)
    },
    setFeedrate(val = 0) {
      this.feedRate = parseInt(val)
    },
    setModal(modal) {
      Object.entries(modal).forEach(([key, value]) => {
        this.modal[key] = value
      })
      if (this.modal.units !== modal.units) {
        this.jogDistance = 1
        this.jogSpeed = this.speedFallback
      }
    },
    setMpos(mpos) {
      Object.entries(mpos).forEach(([key, value]) => {
        this.mpos[key] = value
      })
    },
    setWpos(wpos) {
      Object.entries(wpos).forEach(([key, value]) => {
        this.wpos[key] = value
      })
    },
    setOverrides(feed, rapid, spindle) {
      this.overrides = {
        feed,
        rapid,
        spindle,
      }
    },
    async loadMacros() {
      if (!this.client) {
        return
      }
      const macros = await this._client.fetch('macros')
      if (!macros) {
        return
      }
      this.macros = macros.records.reduce((lookup, macro) => {
        lookup[macro.name] = macro.id
        return lookup
      }, {})
    },
    addActiveCommand(commandId, taskId) {
      this._activeCommands[commandId] = taskId
    },
    clearActiveCommand(taskId) {
      Object.keys(this._activeCommands).forEach((key) => {
        if (this._activeCommands[key] === taskId) {
          delete this._activeCommands[key]
        }
      })
    },
    clearActiveCommands() {
      Object.keys(this._activeCommands).forEach((key) => {
        delete this._activeCommands[key]
      })
    },
    commandRunning(id) {
      return !!this._activeCommands[id]
    },
    addActiveWorker(workerId) {
      this._activeWorkers[workerId] = true
    },
    clearActiveWorker(workerId) {
      delete this._activeWorkers[workerId]
    },
    workerRunning(workerId) {
      return !!this._activeWorkers[workerId]
    },
    async loadCommands() {
      if (!this._client) {
        return
      }
      const commands = await this._client.fetch('commands')
      if (!commands) {
        return
      }

      this.commands = commands.records.reduce((lookup, command) => {
        lookup[command.title] = command.id
        return lookup
      }, {})
    },
    async listCommands() {
      if (!this.commands) {
        await this.loadCommands()
      }

      return this.commands
    },
    async listMacros() {
      if (!this.macros) {
        await this.loadMacros()
      }

      return this.macros
    },
    async runCommand(id) {
      if (!this._client) {
        return
      }
      const { taskId } = await this._client.post(`commands/run/${id}`)
      if (!taskId) {
        return
      }
      this.addActiveCommand(id, taskId)
    },
    async getMacroId(macroName) {
      if (!this.macros) {
        await this.loadMacros()
      }
      return this.macros?.[macroName]
    },
    async getCommandId(commandName) {
      if (!this.commands) {
        await this.loadCommands()
      }
      return this.commands?.[commandName]
    },
  },
  getters: {
    _output: (state) => {
      const fields = ['axes', 'axisSpeeds']

      return Object.fromEntries(fields.map((field) => [field, state[field]]))
    },
    isRelativeMove: (state) => state.modal.distance === 'G91',
    distanceUnit: (state) => (state.modal.units === 'G21' ? 'mm' : 'in'),
    distances: (state) => jogDistances[state.distanceUnit],
    speeds: (state) => jogSpeeds[state.distanceUnit],
    speedFallback: (state) => (state.distanceUnit === 'mm' ? 500 : 75),
    hold: (state) => state.runState === cncStates.HOLD,
    paused: (state) =>
      state.workflowState === workflowStates.PAUSE ||
      state.feederState === feederStates.PAUSE,
    feedPaused: (state) => state.feederState === feederStates.PAUSE,
    idle: (state) =>
      state.workflowState === workflowStates.IDLE &&
      state.feederState === feederStates.IDLE,
    running: (state) =>
      state.workflowState === workflowStates.RUNNING &&
      state.feederState === feederStates.IDLE,
    alarm: (state) => state.runState === cncStates.ALARM,
    elapsedTimeText: (state) => {
      if (!state.elapsedTime) {
        return ''
      }
      return formatDuration(state.elapsedTime)
    },
    displayWpos: (state) => formatAxes(state.wpos, state.axes),
    displayMpos: (state) => formatAxes(state.mpos, state.axes),
    remainingTimeText: (state) => {
      if (!state.remainingTime) {
        return ''
      }
      return formatDuration(state.remainingTime)
    },
    alarmText: (state) =>
      `${['Alarm', state.alarmReason, state.locked ? 'Locked' : null]
        .filter(Boolean)
        .join('\n')}`,
    pauseText: (state) => pauseText(state.pauseReason, state.pauseMessage),
    feedPauseText: (state) =>
      pauseText(state.feedPauseReason, state.feedPauseMessage),
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
      state.feederState === feederStates.IDLE &&
      (state.runState === cncStates.IDLE || state.runState === cncStates.JOG),
  },
})
