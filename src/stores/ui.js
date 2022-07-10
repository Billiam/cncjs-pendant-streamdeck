import { defineStore } from 'pinia'

export const useUiStore = defineStore({
  id: 'ui',

  state: () => ({
    active: true,
    activityTimeout: null,
    bgColor: 2,
    brightness: 60,
    buttons: {
      showAbsolutePosition: false,
    },
    columns: 5,
    font: 'monospace',
    fontSize: 12,
    lineHeight: 14,
    feedrateInterval: 1,
    spindleInterval: 1,
    fileDetailsPath: null,
    fileDetails: {},
    fileDetailsSort: 'alpha_asc',
    gcodeColors: {},
    iconSize: 72,
    userFlags: {},
    input: {
      value: '',
      previous: 0,
      type: '',
      callback: () => {},
    },
    palette: ['#000', '#fff'],
    pos: 'wpos',
    progressColor: 4,
    rows: 3,
    sceneStack: [],
    textColor: 1,
    textShadow: false,
    timeout: 0,
    web: true,
  }),

  getters: {
    sceneName: (state) => {
      return state.sceneStack[state.sceneStack.length - 1]
    },
    fileDetailSize: (state) => {
      if (!state.fileDetails) {
        return '0'
      }
      const size = state.fileDetails.size
      if (size > 1024) {
        const digits = size > 5120 ? 0 : 1
        return `${+(size / 1024).toFixed(digits)}K`
      } else {
        return `${size}`
      }
    },
    fileDetailModifiedTime: (state) => {
      if (!state.fileDetails) {
        return ''
      }
      return new Date(state.fileDetails.mtime).toLocaleString()
    },
    fileDetailCreatedTime: (state) => {
      if (!state.fileDetails) {
        return ''
      }
      return new Date(state.fileDetails.ctime).toLocaleString()
    },
    displayBrightness: (state) => state.brightness,
  },

  actions: {
    addInput(chars) {
      const inputTest = /^-?(0|[1-9]\d*)?(?:\.\d*)?$/
      // trim leading zeroes followed by non-zeroes
      const newValue = (this.input.value + chars).replace(/^0+(?=[1-9]|0)/, '')
      if (inputTest.test(newValue)) {
        this.input.value = newValue
      }
    },
    toggleShowAbsolutePosition() {
      this.buttons.showAbsolutePosition = !this.buttons.showAbsolutePosition
    },
    toggleInputSign() {
      if (this.input.value.startsWith('-')) {
        this.input.value = this.input.value.slice(1)
      } else {
        this.input.value = '-' + this.input.value
      }
    },
    startInput(value, type, scene = 'numpad', callback = () => {}) {
      this.input.value = ''
      this.input.previous = value
      this.input.type = type
      this.input.callback = callback
      this.goToScene(scene)
    },
    completeInput() {
      this.input.callback(this.input.value)
      this.input.value = ''
      this.goBack()
    },
    toggleFeedrateInterval() {
      this.feedrateInterval = this.feedrateInterval === 1 ? 10 : 1
    },
    toggleSpindleInterval() {
      this.spindleInterval = this.spindleInterval === 1 ? 10 : 1
    },
    setGrid(rows, columns) {
      this.columns = columns
      this.rows = rows
    },
    setBgColor(color) {
      this.bgColor = color
    },
    clearUserFlag(id) {
      delete this.userFlags[id]
    },
    setBrightness(brightness) {
      if (brightness != null) {
        this.brightness = Math.max(Math.min(100, brightness), 10)
      }
    },
    setIconSize(size) {
      this.iconSize = size
    },
    setGcodeColors(colors) {
      if (!colors) {
        return
      }
      this.gcodeColors = Object.freeze(colors)
    },
    activity() {
      this.active = true
      clearTimeout(this.activityTimeout)
      this.activityTimeout = setTimeout(this.inactive.bind(this), this.timeout)
    },
    inactive() {
      this.active = false
    },
    decreaseBrightness() {
      this.setBrightness(this.brightness - 10)
    },
    increaseBrightness() {
      this.setBrightness(this.brightness + 10)
    },
    setTimeout(timeout) {
      this.timeout = timeout
    },
    setWeb(web) {
      this.web = !!web
    },
    setUserFlag(id, value) {
      this.userFlags[id] = value
    },
    setProgressColor(color) {
      this.progressColor = color
    },
    setPalette(colors) {
      this.palette = colors
    },
    setScene(scene) {
      this.sceneStack.splice(0)
      this.sceneStack.push(scene)
    },
    swapScene(scene) {
      this.sceneStack.splice(this.sceneStack.length - 1, 1, scene)
    },
    goToScene(scene) {
      if (this.sceneName !== scene) {
        this.sceneStack.push(scene)
      }
    },

    goBack(count = 1) {
      if (this.sceneStack.length > 1) {
        this.sceneStack.splice(-count, count)
      }
    },
  },
})
