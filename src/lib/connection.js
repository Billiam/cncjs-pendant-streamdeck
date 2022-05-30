import io from 'socket.io-client'

const getToken = () => {
  const query = new URLSearchParams(window.location.search)
  if (query.has('token')) {
    return query.get('token')
  }
  const cncConfig = JSON.parse(localStorage.getItem('cnc') || '{}')
  return cncConfig?.state?.session?.token || ''
}
console.log('reloaded file')
export default async (options, callback = () => {}) => {
  options.baudrate = options.baudrate || 115200
  options.socketAddress = options.socketAddress || 'localhost'
  options.socketPort = options.socketPort || 8000
  options.controllerType = options.controllerType || 'Grbl'
  options.accessTokenLifetime = options.accessTokenLifetime || '30d'
  console.log('Reloaded socket1')
  const token = getToken()
  const url = `ws://${options.socketAddress}/`
  let socket = io.connect(url, {
    // path: '/socket.io/',
    query: `token=${token}`,
    transports: ['websocket'],
  })

  socket.on('connecting', (a) => {
    console.debug('Connecting', a)
  })
  socket.on('connect_error', (err) => {
    console.debug(`connect_error due to ${err.message}`, err)
  })
  socket.on('connect', () => {
    console.debug('Connected to ' + url)

    // Open port
    socket.emit('open', options.port, {
      baudrate: Number(options.baudrate),
      controllerType: options.controllerType,
    })
  })

  socket.on('error', (err) => {
    console.error('Connection error.', err)
    if (socket) {
      socket.destroy()
      socket = null
    }
  })

  socket.on('close', () => {
    console.debug('Connection closed.')
  })

  socket.on('serialport:open', function (options) {
    options = options || {}

    console.log(
      'Connected to port "' +
        options.port +
        '" (Baud rate: ' +
        options.baudrate +
        ')'
    )

    callback(null, { socket, options })
  })

  socket.on('serialport:error', function (options) {
    callback(new Error('Error opening serial port "' + options.port + '"'))
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
  socket.on('gcode:load', function (name, gcode) {
    console.debug('gcode:load', name, gcode)
  })

  socket.on('workflow:state', function (data) {
    console.debug('workflow:state', data)
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
  return socket
}
