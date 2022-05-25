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
  }),

  getters: {
    sceneName: (state) => {
      return state.sceneStack[state.sceneStack.length - 1]
    },
  },

  actions: {
    setGrid(rows, columns) {
      this.columns = columns
      this.rows = rows
    },
    setBgColor(color) {
      this.bgColor = color
    },
    setActiveBgColor(color) {
      this.activeBgColor = color
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
