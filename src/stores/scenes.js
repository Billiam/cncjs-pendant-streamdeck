import { defineStore } from 'pinia'

export const useScenesStore = defineStore('scenes', {
  state: () => ({
    _scenes: {},
  }),
  getters: {
    scenes: (state) => state._scenes,
  },
  actions: {
    setScenes(scenes) {
      this._scenes = scenes
    },
  },
})
