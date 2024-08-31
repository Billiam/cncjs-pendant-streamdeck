const parentPort = require('worker_threads').parentPort

import { buildOutline } from '@/lib/gcode-outline'

parentPort.on('message', (event) => {
  let perimeter = buildOutline(
    event.gcode,
    event.x,
    event.y,
    event.feedbackUnits
  )

  parentPort.postMessage({
    data: {
      name: event.name,
      perimeter,
    },
  })
})
