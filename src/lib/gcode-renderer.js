import { preview } from '@/vendor/gcodethumbnail/gcodethumbnail'

const animatedWait = (delay) => () => {
  return new Promise((resolve) => setTimeout(resolve, delay))
}
export const renderToolpath = (canvas, parsedGcode, settings) => {
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
    animatedDraw(parsedGcode.lines, drawLine, 4000)
  } else {
    draw(parsedGcode.lines, drawLine)
  }
}

function* chunkLines(lines, size = 1) {
  for (let i = 0; i < lines.length; i += size) {
    yield lines.slice(i, i + size)
  }
}

const animatedDraw = async (lines, drawLine, duration) => {
  const fps = 30
  const linesPerFrame = lines.length / (duration / fps)
  const wait = animatedWait(1000 / 30)
  const gen = chunkLines(lines, linesPerFrame)
  for (const chunk of gen) {
    chunk.forEach(drawLine)
    await wait()
  }
}

const draw = async (lines, drawLine) => {
  let nextWait = Date.now() + 30
  const wait = animatedWait(60)
  for (const line of lines) {
    if (Date.now() > nextWait) {
      await wait()
      nextWait = Date.now() + 30
    }
    drawLine(line)
  }
}
