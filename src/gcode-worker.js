import { parse } from '@/vendor/gcodetogeometry/gcodetogeometry'

self.addEventListener('message', (event) => {
  const gcode = event.data.gcode.replace(/^%.*/gm, '')
  self.postMessage({
    name: event.data.name,
    geometry: parse(gcode),
  })
})
