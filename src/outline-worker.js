import { buildOutline } from '@/lib/gcode-outline'

self.addEventListener('message', (event) => {
  const perimeter = buildOutline(event.data.gcode, event.data.x, event.data.y)

  self.postMessage({
    name: event.data.name,
    perimeter,
  })
})
