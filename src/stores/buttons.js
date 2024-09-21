import { defineStore } from 'pinia'

export const useButtonStore = defineStore({
  id: 'buttons',
  state: () => ({
    _buttons: {},
  }),
  getters: {
    buttons: (state) => state._buttons,
    button: (state) => (buttonName) => state._buttons[buttonName],
  },
  actions: {
    renameScene(oldName, newName) {
      const sceneActions = ['setScene', 'swapScene', 'navigate']
      Object.values(this._buttons).forEach((button) => {
        button.actions?.forEach((action) => {
          if (sceneActions.includes(action.action)) {
            if (action.arguments?.[0] === oldName) {
              console.log('Setting new action', button)
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
            if (action.arguments?.[0] === scene) {
              console.log('Removing', action)
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
      console.log({ buttons })
      this._buttons = buttons
    },
  },
})
