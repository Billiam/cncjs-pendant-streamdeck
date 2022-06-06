import io from 'socket.io-client'
import mitt from 'mitt'

const getToken = () => {
  const query = new URLSearchParams(window.location.search)
  if (query.has('token')) {
    return query.get('token')
  }
  const cncConfig = JSON.parse(localStorage.getItem('cnc') || '{}')
  return cncConfig?.state?.session?.token || ''
}

const Connection = function (opts) {
  const options = { ...opts }
  options.baudrate ??= 115200
  options.socketAddress ??= 'localhost'
  options.socketPort ??= 8000
  options.controllerType ??= 'Grbl'
  options.accessTokenLifetime ??= '30d'
  this.options = options
  this.emitter = mitt()
}

const proto = Connection.prototype

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
  socket.on('connect_error', (err) => {
    console.debug(`connect_error due to ${err.message}`, err)
  })
  socket.on('serialport:close', (data) => {
    console.debug('Closed serialport', data)
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
    console.debug('gcode:load', name, gcode, context)
  })
  socket.on('workflow:state', function (data) {
    console.debug('workflow:state', data)
  })
}

proto.connect = function () {
  const options = this.options

  return new Promise((resolve, reject) => {
    const token = getToken()
    const url = `ws://${options.socketAddress}/`

    const socket = io.connect(url, {
      // path: '/socket.io/',
      query: `token=${token}`,
      transports: ['websocket'],
    })

    this.socket = socket

    const openSocket = () => {
      socket.emit('open', options.port, {
        baudrate: Number(options.baudrate),
        controllerType: options.controllerType,
      })
    }

    socket.on('connect', () => {
      console.debug('Connected to ' + url)
      // Open port
      openSocket()
    })

    socket.on('serialport:open', (options = {}) => {
      this.options = { ...this.options, options }
      console.log(
        'Connected to port "' +
          options.port +
          '" (Baud rate: ' +
          options.baudrate +
          ')'
      )
      resolve({ socket })
    })

    socket.on('serialport:change', ({ port, inuse }) => {
      if (inuse) {
        openSocket()
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

    if (this.debugEnabled) {
      this.debug()
    }
  })

  // const apiUrl = `http://${options.socketAddress}/api/state?token=${token}`
  // const res = await fetch(apiUrl, {
  //   mode: 'no-cors', // no-cors, *cors, same-origin
  // })
  // const j = await res.text()
  // console.log({ j })

  /*
    socket.on('serialport:write', function(data) {
        console.log((data || '').trim());
    });
    */
}

export default Connection
