import { buildOutline } from '@/lib/gcode-outline'

self.addEventListener('message', (event) => {
  try {
    const perimeter = buildOutline(
      event.data.gcode,
      event.data.x,
      event.data.y,
      event.data.feedbackUnits,
    )
    self.postMessage({
      name: event.data.name,
      perimeter,
    })
  } catch (e) {
    self.postMessage({
      error: e.message,
      name: event.data.name,
    })
  }
})
