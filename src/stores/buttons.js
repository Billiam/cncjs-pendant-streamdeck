import { defineStore } from 'pinia'

import { groupedActions } from '@/lib/grouped-actions'
import {
  downArrow,
  fileButton,
  folderButton,
  previousFolder,
  upArrow,
} from '@/lib/scene/file-list-buttons'
import { useUiStore } from '@/stores/ui'

const fileButtonMap = {
  fileListDownArrow: downArrow,
  fileListFile: fileButton,
  fileListFolderButton: folderButton,
  fileListPreviousFolder: previousFolder,
  fileListUpArrow: upArrow,
}

export const useButtonStore = defineStore({
  id: 'buttons',
  state: () => ({
    _buttons: {},
  }),
  getters: {
    buttons: (state) => state._buttons,
    button: (state) => (buttonName) => state._buttons[buttonName],
    fileButton: (state) => (buttonName) => {
      if (fileButtonMap[buttonName]) {
        return {
          ...fileButtonMap[buttonName],
          ...(state._buttons[buttonName] ?? {}),
        }
      }
    },
    fileButtonNames: () => {
      return Object.keys(fileButtonMap)
    },
    _userFlags: (state) => {
      const flags = Object.values(state._buttons).reduce((list, button) => {
        button.actions
          ?.filter((action) =>
            groupedActions['User flags'].includes(action.action),
          )
          .forEach((action) => {
            const flag = action.arguments?.[0]
            if (flag != null) {
              list.add(flag)
            }
          })
        return list
      }, new Set())

      return Array.from(flags).sort()
    },
    output: (state) => {
      const fileButtonNames = state.fileButtonNames
      const result = {}
      Object.entries(state._buttons).forEach(([name, button]) => {
        if (fileButtonNames.includes(name)) {
          result[name] = Object.fromEntries(
            Object.entries(button).filter(([name, _button]) => name !== 'text'),
          )
        } else {
          result[name] = button
        }
      })
      return result
    },
  },
  actions: {
    loadEditorButtons() {
      Object.keys(fileButtonMap).forEach((key) => {
        this.buttons[key] = this.fileButton(key)
      })
    },
    renameScene(oldName, newName) {
      const sceneActions = ['setScene', 'swapScene', 'navigate']
      Object.values(this._buttons).forEach((button) => {
        button.actions?.forEach((action) => {
          if (sceneActions.includes(action.action)) {
            if (action.arguments?.[0] === oldName) {
              action.arguments[0] = newName
            }
          }
        })
      })
    },
    deleteScene(scene) {
      const sceneActions = ['setScene', 'swapScene', 'navigate']
      Object.values(this._buttons).forEach((button) => {
        if (button.actions) {
          button.actions = button.actions.filter((action) => {
            if (!sceneActions.includes(action.action)) {
              return true
            }
            return action.arguments?.[0] !== scene
          })
        }
      })
    },
    updateButton(button, key, value) {
      this._buttons[button][key] = value
    },
    addButtonAction(button, properties) {
      this._buttons[button].actions ??= []
      this._buttons[button].actions.push(properties)
    },
    updateButtonAction(button, index, key, value) {
      if (value === undefined) {
        delete this._buttons[button].actions[index][key]
      } else {
        this._buttons[button].actions[index][key] = value
      }
    },
    deleteButtonAction(button, index) {
      this._buttons[button].actions.splice(index, 1)
    },
    removeButtonField(button, key) {
      delete this._buttons[button][key]
    },
    addButton(buttonName, button) {
      this._buttons[buttonName] = button
    },
    setButtons(buttons) {
      if (buttons) {
        this._buttons = buttons
      }
      const { editor } = useUiStore()
      if (editor) {
        this.loadEditorButtons()
      }
    },
  },
})
