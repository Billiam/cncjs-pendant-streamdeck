import { parse } from '@/vendor/gcodetogeometry/gcodetogeometry'
const parentPort = require('worker_threads').parentPort

// some code duplication here compared to the webpack worker due to vite+rollup
// limitations
parentPort.on('message', (event) => {
  // strip lines beginning with % or containing [
  const gcode = event.gcode.replace(/^%.*/gm, '').replace(/^.*\[.*/gm, '')
  parentPort.postMessage({
    data: {
      name: event.name,
      geometry: parse(gcode),
    },
  })
})
