import mitt from 'mitt'
import io from 'socket.io-client'

import { ConnectionError } from './connection-error'

const Connection = function (opts, token) {
  const options = { ...opts }
  options.baudRate ??= 115200
  options.socketAddress ??= 'localhost'
  options.secure ??= false
  options.socketPort ??= 8000
  options.controllerType ??= 'Grbl'
  options.accessTokenExpiration ??= '30d'

  this.options = options
  this.emitter = mitt()
  this.token = token
}

const proto = Connection.prototype

proto.validate = function () {
  const { socketAddress, port, baudRate, controllerType } = this.options

  const required = {
    token: this.token,
    socketAddress,
    port,
    baudRate,
    controllerType,
  }
  Object.entries(required).forEach(([key, val]) => {
    if (!val) {
      throw new ConnectionError(`${key} is required and was empty`)
    }
  })
}

proto.updateConfig = function (options) {
  this.options = { ...this.options, ...options }
}

proto.on = function (...args) {
  this.emitter.on(...args)
}
proto.off = function (...args) {
  this.emitter.off(...args)
}

proto.debug = function () {
  this.debugEnabled = true
  if (!this.socket || this.debugging) {
    return
  }

  this.debugging = true
  const socket = this.socket
  socket.on('connecting', (a) => {
    console.debug('Connecting')
  })
  socket.on('connect', () => {
    console.log('connected')
  })
  socket.on('connect_error', (err) => {
    console.debug(`connect_error due to ${err.message}`, err)
  })
  socket.on('serialport:close', (data) => {
    console.debug('Closed serialport', data)
  })
  socket.on('controller:state', (data) => {
    console.debug('controller:state', data)
  })
  socket.on('close', () => {
    console.debug('Connection closed.')
  })
  socket.on('serialport:read', function (data) {
    console.debug('serialport:read', (data || '').trim())
  })
  socket.on('feeder:status', function (data) {
    console.debug('feeder:status', data)
  })
  socket.on('sender:status', function (data) {
    console.debug('sender:status', data)
  })
  socket.on('Grbl:state', function (data) {
    console.debug('Grbl:state', data)
  })
  socket.on('Grbl:settings', function (data) {
    console.debug('grbl:settings', data)
  })
  socket.on('gcode:load', function (name, gcode, context) {
    console.debug('gcode:load', name, gcode.length, context)
  })
  socket.on('gcode:unload', function () {
    console.debug('gcode:unload')
  })
  socket.on('workflow:state', function (data) {
    console.debug('workflow:state', data)
  })
}

proto.openPort = function (port, baudRate, controllerType) {
  this.socket.emit('open', port, {
    baudrate: Number(baudRate),
    controllerType,
  })
}

proto.openSerialPort = function () {
  const { baudRate, controllerType, port } = this.options
  this.openPort(port, baudRate, controllerType)
}

proto.closeSerialPort = function () {
  this.socket.emit('close', this.options.port)
}

proto.socketUrl = function () {
  const { socketAddress, socketPort, secure } = this.options

  return `${secure ? 'wss' : 'ws'}://${socketAddress}:${socketPort}/`
}

proto.reconnect = function () {
  if (!this.socket) {
    return
  }
  this.socket.disconnect()
  this.emitter.emit('disconnected')

  this.validate()

  this.socket.io.uri = this.socketUrl()
  this.socket.connect()
}

proto.connect = function () {
  return new Promise((resolve, reject) => {
    const socket = io.connect(this.socketUrl(), {
      query: `token=${this.token}`,
      transports: ['websocket'],
    })

    this.socket = socket

    socket.on('connect_error', (e) => {
      console.error(e.type, e)
      reject(new Error(e.description?.message))
    })

    socket.on('connect', () => {
      resolve({ socket })
      // Open port
      this.openSerialPort()
    })

    socket.on('serialport:open', (options = {}) => {
      this.options = { ...this.options, options }
      console.log(`Connected to port ${options.port}`)
      // resolve({ socket })
    })
    socket.on('serialport:change', ({ port, inuse }) => {
      console.log({ change: inuse })
      if (inuse) {
        this.openSerialPort()
        this.emitter.emit('reconnected', { port })
      } else {
        this.emitter.emit('disconnected')
      }
    })

    socket.on('error', (err) => {
      console.error('Connection error.', err)
      if (socket) {
        socket.destroy()
        this.socket = null
        reject(err)
      }
    })

    socket.on('serialport:error', function (options) {
      reject(new Error(`Error opening serial port "${options.port}"`))
    })

    if (import.meta.env.DEV) {
      this.debug()
    }

    return socket
  })
}

export default Connection
