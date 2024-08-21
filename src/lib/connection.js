import { ConnectionError } from './connection-error'
import mitt from 'mitt'

const Connection = function (opts, token) {
  const options = { ...opts }
  options.baudrate ??= 115200
  options.socketAddress ??= 'localhost'
  options.secure ??= false
  options.socketPort ??= 8000
  options.controllerType ??= 'Grbl'
  options.accessTokenLifetime ??= '30d'
  this.options = options
  this.emitter = mitt()
  this.token = token
}

const proto = Connection.prototype

proto.validate = function () {
  const { socketAddress, port, baudrate, controllerType } = this.options

  const required = {
    token: this.token,
    socketAddress,
    port,
    baudrate,
    controllerType,
  }
  Object.entries(required).forEach(([key, val]) => {
    if (!val) {
      throw new ConnectionError(`${key} is required and was empty`)
    }
  })
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
  socket.on('connect', (data) => {
    console.log('connected', data)
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
    console.debug(
      'gcode:load',
      name,
      gcode.substring(0, 40),
      gcode.length,
      context
    )
  })
  socket.on('file:load', function (code, length, file, visualizer) {
    console.debug('file:load', code.substring(0, 40), length, file, visualizer)
  })
  socket.on('file:unload', function (...args) {
    console.debug('file:unload', { ...args })
  })
  socket.on('gcode:unload', function () {
    console.debug('gcode:unload')
  })
  socket.on('workflow:state', function (data) {
    console.debug('workflow:state', data)
  })
}

proto.openPort = function (port, baudrate, controllerType) {
  this.socket.emit('open', port, {
    baudrate: Number(baudrate),
    controllerType,
  })
}

proto.openSerialPort = function () {
  const { baudrate, controllerType, port } = this.options
  this.openPort(port, baudrate, controllerType)
}

proto.connect = function () {
  const { socketAddress, socketPort, secure, sender } = this.options
  this.validate()

  return new Promise(async (resolve, reject) => {
    const url = `${secure ? 'wss' : 'ws'}://${socketAddress}:${socketPort}/`

    let socketio
    if (sender === 'gsender') {
      socketio = await import('socket.io-client.gsender')
    } else {
      socketio = await import('socket.io-client')
    }
    const io = socketio.default

    const socket = io.connect(url, {
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
  })
}

export default Connection
