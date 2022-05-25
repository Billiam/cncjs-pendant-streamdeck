import { defineStore } from 'pinia'

export const useButtonStore = defineStore({
  id: 'buttons',
  state: () => ({
    _buttons: {},
  }),
  getters: {
    buttons: (state) => state._buttons,
  },
  actions: {
    setButtons(buttons) {
      this._buttons = buttons
    },
  },
})
