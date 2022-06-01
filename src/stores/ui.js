import { defineStore } from 'pinia'

export const useUiStore = defineStore({
  id: 'ui',

  state: () => ({
    sceneStack: [],
    columns: 5,
    rows: 3,
    textColor: 1,
    palette: ['#000', '#fff'],
    bgColor: 2,
    progressColor: 4,
    pos: 'wpos',
    input: {
      value: '',
      previous: 0,
      type: '',
      callback: () => {},
    },
  }),

  getters: {
    sceneName: (state) => {
      return state.sceneStack[state.sceneStack.length - 1]
    },
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
    setGrid(rows, columns) {
      this.columns = columns
      this.rows = rows
    },
    setBgColor(color) {
      this.bgColor = color
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

    goBack() {
      if (this.sceneStack.length > 1) {
        this.sceneStack.pop()
      }
    },
  },
})
