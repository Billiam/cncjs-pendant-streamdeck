import { defineStore } from 'pinia'

export const useScenesStore = defineStore('scenes', {
  state: () => ({
    _scenes: {},
  }),
  getters: {
    scenes: (state) => state._scenes,
    scene: (state) => (sceneName) => state._scenes[sceneName],
    sceneNames: (state) => Object.keys(state._scenes),
  },
  actions: {
    setScenes(scenes) {
      this._scenes = scenes
    },
    addScene(scene) {
      if (this._scenes[scene] == null) {
        this._scenes[scene] = { buttons: [] }
      }
    },
    addButton(scene, button, row, column) {
      if (button == null) {
        return
      }
      this._scenes[scene].buttons ??= []

      const rows = this._scenes[scene].buttons
      while (rows.length < row + 1) {
        rows.push([])
      }
      const buttonRow = rows[row]
      while (buttonRow.length < column) {
        buttonRow.push(null)
      }
      const existing = buttonRow[column]

      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(button)
        } else {
          buttonRow.splice(column, 1, [existing, button])
        }
      } else {
        buttonRow.splice(column, 1, button)
      }
    },
    removeButton(scene, button, r, c) {
      const row = this._scenes[scene].buttons[r]
      if (!row) {
        return
      }
      if (Array.isArray(row[c])) {
        const index = row[c].indexOf(button)
        if (index !== -1) {
          row[c].splice(index, 1)
        }
      } else if (row[c] === button) {
        if (row.length - 1 === c) {
          row.splice(c, 1)
        } else {
          row.splice(c, 1, null)
        }
      }
    },
  },
})
