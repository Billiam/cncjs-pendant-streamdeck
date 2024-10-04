import { defineStore } from 'pinia'

import { useButtonStore } from '@/stores/buttons'
import { useUiStore } from '@/stores/ui'

export const useScenesStore = defineStore('scenes', {
  state: () => ({
    _scenes: {
      home: { buttons: [] },
    },
  }),
  getters: {
    scenes: (state) => state._scenes,
    scene: (state) => (sceneName) => state._scenes[sceneName],
    sceneNames: (state) => Object.keys(state._scenes),
  },
  actions: {
    setScenes(scenes) {
      if (scenes) {
        this._scenes = scenes
      }
    },
    addScene(scene) {
      if (this._scenes[scene] == null) {
        this._scenes[scene] = { buttons: [] }
      }
    },
    removeScene(scene) {
      delete this._scenes[scene]

      const buttonStore = useButtonStore()
      buttonStore.deleteScene(scene)

      const uiStore = useUiStore()
      uiStore.deleteScene(scene)
    },
    renameScene(oldName, newName) {
      if (!this._scenes[oldName]) {
        return
      }
      this._scenes[newName] = this._scenes[oldName]
      delete this._scenes[oldName]
      this._scenes[newName].name = newName

      const buttonStore = useButtonStore()
      buttonStore.renameScene(oldName, newName)

      // update navigation stack
      const uiStore = useUiStore()
      uiStore.renameScene(oldName, newName)
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
