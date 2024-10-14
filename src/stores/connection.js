import { defineStore } from 'pinia'

export const useConnectionStore = defineStore({
  id: 'connection',

  state: () => ({
    accessTokenExpiration: '30d',
    baudRate: 115200,
    controllerType: 'Grbl',
    port: null,
    secure: false,
    socketPort: 8000,
    socketAddress: 'localhost',
    _ports: [],
  }),
  getters: {
    _output: (state) => {
      const fields = [
        'accessTokenExpiration',
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
      this.accessTokenExpiration = config.accessTokenExpiration ?? '30d'
    },
  },
})
