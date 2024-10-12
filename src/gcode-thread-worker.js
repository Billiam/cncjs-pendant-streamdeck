import { parse } from '@/vendor/gcodetogeometry/gcodetogeometry'

const parentPort = require('worker_threads').parentPort

const stringLimit = (str, limit) => {
  const l = str.length
  let i = -1
  const newline = '\n'
  while (limit-- && i++ < l) {
    i = str.indexOf(newline, i)
    if (i < 0) return str
  }
  return str.substring(0, i)
}
// some code duplication here compared to the webpack worker due to vite+rollup
// limitations
parentPort.on('message', (event) => {
  // strip lines beginning with % or containing [
  let gcode = event.gcode
  if (event.limit) {
    gcode = stringLimit(gcode, event.limit)
  }
  parentPort.postMessage({
    data: {
      name: event.name,
      geometry: parse(gcode),
    },
  })
})
