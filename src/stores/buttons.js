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
