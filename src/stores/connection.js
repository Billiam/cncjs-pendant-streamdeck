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
  getters: {
    output: (state) => {
      const fields = [
        'baudRate',
        'controllerType',
        'port',
        'secure',
        'socketPort',
        'socketAddress',
      ]

      return Object.fromEntries(fields.map((field) => [field, state[field]]))
    },
  },
  actions: {
    setConfig(config) {
      this.baudRate = config.baudRate ?? 115200
      this.port = config.port
      this.secure = config.secure ?? false
      this.socketAddress = config.socketAddress ?? 'localhost'
      this.socketPort = config.socketPort ?? 8000
      this.controllerType = config.controllerType ?? 'Grbl'
    },
  },
})
