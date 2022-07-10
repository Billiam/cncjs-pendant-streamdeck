import { preview } from '@/vendor/gcodethumbnail/gcodethumbnail'

const animatedWait = (delay) => () => {
  return new Promise((resolve) => setTimeout(resolve, delay))
}
export const renderToolpath = (
  canvas,
  parsedGcode,
  settings,
  callback = () => {}
) => {
  const colors = {
    G0: '#52ff2e',
    G1: '#9a96ff',
    G2G3: '#9a96ff',
  }

  const options = { autosize: true, ...settings }

  const drawLine = preview(parsedGcode.size, colors, options, canvas)
  if (!drawLine) {
    return
  }

  if (options.animate) {
    return animatedDraw(parsedGcode.lines, drawLine, 4000, callback)
  } else {
    return draw(parsedGcode.lines, drawLine, callback)
  }
}

function* chunkLines(lines, size = 1) {
  for (let i = 0, l = lines.length; i < l; i += size) {
    yield [i + size, lines.slice(i, i + size)]
  }
}

const animatedDraw = async (lines, drawLine, duration, callback) => {
  const fps = 30
  const linesPerFrame = Math.floor(lines.length / ((duration / 1000) * fps))
  const wait = animatedWait(1000 / fps)
  const gen = chunkLines(lines, linesPerFrame)
  for (const [index, chunk] of gen) {
    chunk.forEach(drawLine)
    callback(index)
    await wait()
  }
  callback(lines.length)
}

const draw = async (lines, drawLine, callback) => {
  let nextWait = Date.now()
  const wait = animatedWait(60)
  for (const [index, line] of Object.entries(lines)) {
    drawLine(line)
    if (Date.now() > nextWait) {
      callback(index)
      await wait()
      nextWait = Date.now() + 50
    }
  }
  callback(lines.length)
}
