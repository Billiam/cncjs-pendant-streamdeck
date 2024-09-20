import { defineStore } from 'pinia'

export const useConnectionStore = defineStore({
  id: 'connection',

  state: () => ({
    baudRate: 115200,
    controllerType: 'Grbl',
    port: null,
    secure: false,
    socketPort: 8000,
    socketAddress: 'localhost',
  }),

  actions: {
    setConfig(config) {
      this.baudRate = config.baudRate ?? 115200
      this.port = config.port
      this.secure = config.secure ?? false
      this.socketAddress = config.socketAddress ?? 'localhost'
      this.socketPort = config.socketPort ?? '8000'
      this.controllerType = config.controllerType ?? 'Grbl'
    },
  },
})
