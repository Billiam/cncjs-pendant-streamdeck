import { defineStore } from 'pinia'

export const useEditorStore = defineStore({
  id: 'editor',

  state: () => ({
    activeRow: null,
    activeColumn: null,
    activeButton: null,
    tab: null,
  }),

  actions: {
    setActiveRow(row) {
      this.activeRow = row
    },
    setActiveColumn(column) {
      this.activeColumn = column
    },
    setActiveButton(buttonName) {
      this.activeButton = buttonName
    },
  },
})
