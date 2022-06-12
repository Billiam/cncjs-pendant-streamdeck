import { parse } from '@/vendor/gcodetogeometry/gcodetogeometry'

self.addEventListener('message', (event) => {
  // stripe lines beginning with % or containing [
  const gcode = event.data.gcode.replace(/^%.*/gm, '').replace(/^.*\[.*/gm, '')

  self.postMessage({
    name: event.data.name,
    geometry: parse(gcode),
  })
})
