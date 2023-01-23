import sharp from 'sharp'
import path from 'path'
import escape from 'lodash/escape'
const icons = {}
const inputSize = 144

const textOffset = (alignment, width) => {
  switch (alignment) {
    case 'start':
      return 4
    case 'middle':
      return width / 2
    case 'end':
      return width - 4
  }
}
const textVOffset = (alignment, height, textHeight) => {
  switch (alignment) {
    case 'text-after-edge':
      return 4
    case 'middle':
      return (height - textHeight) / 2
    case 'text-before-edge':
      return height - textHeight - 4
  }
}

const getRender = async (config, canvas, directory) => {
  if (!config.show) {
    return []
  }

  const columns = config.columns ?? 1
  const rows = config.rows ?? 1
  const outputSize = config.size ?? 72

  const inputWidth = columns * inputSize
  const inputHeight = rows * inputSize
  const outputWidth = config.width
  const outputHeight = config.height
  const createConfig = { width: inputWidth, height: inputHeight, channels: 4 }
  if (config.color) {
    createConfig.background = config.color
  }

  let image = sharp({
    create: createConfig,
  })
  const composite = []
  const finalComposite = []

  if (config.icon) {
    if (!icons[config.icon]) {
      const overlay = await sharp(path.resolve(directory, config.icon))
        .resize({
          width: inputWidth,
          height: inputHeight,
          fit: 'contain',
          kernel: 'cubic',
        })
        .toBuffer()
      icons[config.icon] = overlay
    }
    composite.push({
      input: icons[config.icon],
    })
  }

  if (config.type === 'gcodePreview') {
    const { width, height } = canvas.dimensions()
    finalComposite.push({
      input: await canvas.buffer(),
      top: Math.floor((outputHeight - height) / 2),
      left: Math.floor((outputWidth - width) / 2),
    })
  }

  if (config.text) {
    const fontSize = config.fontSize
    const lineHeight = (config.lineHeight ?? 1.1) * fontSize
    const spanX = textOffset(config.textSvgAlignment, outputWidth)
    const textSpan = config.textLines.map((line) => {
      const text = line === '' ? ' ' : line
      return `<tspan dy="${lineHeight}" x="${spanX}px">${escape(text)}</tspan>`
    })

    const y = textVOffset(
      config.textSvgVerticalAlignment,
      outputHeight,
      config.textLines.length * lineHeight
    )
    const svg = `<svg width="${outputWidth}px" height="${outputHeight}px">
      <text
        fill="${config.cellTextColor}"
        font-size="${fontSize}px"
        font-family="${config.font}"
        text-anchor="${config.textSvgAlignment}"
        dominant-baseline="${config.textSvgVerticalAlignment}"
        y="${y}"
        x="0">${textSpan.join('')}</text>
    </svg>`

    const textBuffer = Buffer.from(svg)
    finalComposite.push({ input: textBuffer, top: 0, left: 0 })
  }

  if (config.holdPercent) {
    const height = outputHeight * config.holdPercent * 1.1
    const svg = `<svg width="${outputWidth}px" height="${outputHeight}px">
      <rect
      width="${outputWidth}px"
      height="${height}px"
      x="0"
      y="${outputHeight - height}px"
      stroke="none"
      fill="${config.cellProgressColor}" />
    </svg>`
    const holdBuffer = Buffer.from(svg)
    finalComposite.push({ input: holdBuffer, top: 0, left: 0 })
  }

  if (config.loadingPercent != null) {
    const radius = Math.min(outputHeight, outputWidth) * 0.4
    const circ = radius * 2 * Math.PI
    const rotation = 360 * config.loadingPercent * 3
    const dashOffset = ((config.loadingPercent + 0.5) % 1) * 2 - 1

    const svg = `<svg width="${outputWidth}px" height="${outputHeight}px">
      <circle
      stroke="${config.cellProgressColor}"
      fill="none"
      stroke-width="8px"
      stroke-linecap="round"
      stroke-dasharray="${circ}"
      stroke-dashoffset="${circ - dashOffset * circ}"
      transform="rotate(${rotation} ${outputWidth / 2} ${outputHeight / 2})"
      cx="${outputWidth / 2}"
      cy="${outputHeight / 2}"
      r="${radius}" />
    </svg>`
    const holdBuffer = Buffer.from(svg)
    finalComposite.push({ input: holdBuffer, top: 0, left: 0 })
  }

  if (!config.enabled) {
    finalComposite.push({
      input: Buffer.from([0, 0, 0, 180]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
    })
  }

  if (composite.length) {
    image = sharp(await image.composite(composite).raw().toBuffer(), {
      raw: { width: inputWidth, height: inputHeight, channels: 4 },
    })
  }

  image = image
    .resize({
      width: outputWidth,
      height: outputHeight,
      kernel: 'cubic',
    })
    .composite(finalComposite)

  if (columns > 1 || rows > 1) {
    const grid = []

    // new operation before resize following a composition
    image = sharp(await image.raw().toBuffer(), {
      raw: { width: outputWidth, height: outputHeight, channels: 4 },
    })

    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        grid.push(
          await image
            .extract({
              left: i * outputSize,
              top: j * outputSize,
              width: outputSize,
              height: outputSize,
            })
            .raw()
            .toBuffer()
        )
      }
    }
    return Promise.all(grid)
  }
  const outputBuffer = await image.raw().toBuffer()
  return [outputBuffer]
}

export default getRender
