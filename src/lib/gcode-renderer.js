import { preview } from '@/vendor/gcodethumbnail/gcodethumbnail'

const animatedWait = (delay) => () => {
  return new Promise((resolve) => setTimeout(resolve, delay))
}
const defaultColors = {
  G0: '#3c7e30',
  G1: '#9a96ff',
  G2G3: '#9a96ff',
}
export const renderToolpath = (
  canvas,
  parsedGcode,
  settings,
  callback = () => {},
  halted = () => false
) => {
  const colors = { ...defaultColors, ...(settings.colors || {}) }
  const options = { autosize: true, ...settings }

  const drawLine = preview(parsedGcode.size, colors, options, canvas)
  if (!drawLine) {
    return
  }

  if (options.animate) {
    return animatedDraw({
      lines: parsedGcode.lines,
      drawLine,
      duration: 4000,
      throttle: settings.throttle,
      callback,
      halted,
    })
  } else {
    return draw(parsedGcode.lines, drawLine, callback, halted)
  }
}

function* chunkLines(lines, size = 1) {
  for (let i = 0, l = lines.length; i < l; i += size) {
    yield [i + size, lines.slice(i, i + size)]
  }
}

const animatedDraw = async ({
  lines,
  drawLine,
  duration,
  callback,
  halted,
  throttle,
}) => {
  let fps = 30
  if (throttle) {
    fps = 1000 / throttle
  }
  const linesPerFrame = Math.max(
    1,
    Math.floor(lines.length / ((duration / 1000) * fps))
  )

  const wait = animatedWait(1000 / fps)
  const gen = chunkLines(lines, linesPerFrame)
  for (const [index, chunk] of gen) {
    if (halted()) {
      return
    }
    chunk.forEach(drawLine)
    callback(index)
    await wait()
  }
  callback(lines.length)
}

const draw = async (lines, drawLine, callback, halted) => {
  let nextWait = Date.now()
  const wait = animatedWait(60)
  for (const [index, line] of Object.entries(lines)) {
    if (halted()) {
      return
    }
    drawLine(line)
    if (Date.now() > nextWait) {
      callback(index)
      await wait()
      nextWait = Date.now() + 50
    }
  }
  callback(lines.length)
}
