import sharp from 'sharp'
const cache = {}

const size = 144

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
const getRender = async (config) => {
  if (!config.show) {
    return []
  }

  const columns = config.columns ?? 1
  const rows = config.rows ?? 1
  const outputSize = 72

  const width = columns * size
  const height = rows * size
  const outputWidth = columns * outputSize
  const outputHeight = rows * outputSize
  const createConfig = { width, height, channels: 4 }
  if (config.color) {
    createConfig.background = config.color
  }

  let image = sharp({
    create: createConfig,
  })
  const composite = []
  const lateComposite = []
  // TODO: push overlays in parallel
  if (config.icon) {
    const overlay = await sharp(`src/public/icons/${config.icon}`)
      .resize({
        width,
        height,
        fit: 'contain',
      })
      .toBuffer()
    composite.push({ input: overlay })
  }

  if (config.text) {
    // TODO: html escape
    // TODO: config font
    // TODO: config line height
    const fontSize = 16 * (config.textSize || 1)
    const lineHeight = 12

    const spanX = textOffset(config.textSvgAlignment, outputWidth)
    const textSpan = config.textLines.map((line) => {
      const text = line === '' ? ' ' : line
      return `<tspan dy="${lineHeight}" x="${spanX}px">${text}</tspan>`
    })

    const y = textVOffset(
      config.textSvgVerticalAlignment,
      outputHeight,
      config.textLines.length * lineHeight
    )

    // TODO: Don't hardcode width/height
    const svg = `<svg width="${outputWidth}" height="${outputHeight}">
      <text
        fill="${config.cellTextColor}"
        font-size="${fontSize}px"
        font-family="ProggyTinyTT"
        text-anchor="${config.textSvgAlignment}"
        dominant-baseline="${config.textSvgVerticalAlignment}"
        y="${y}"
        x="0">${textSpan.join('')}</text>
    </svg>`

    const textBuffer = Buffer.from(svg)
    lateComposite.push({ input: textBuffer })
  }

  if (composite.length) {
    image = image.composite(composite)
  }
  const buffer = await image.raw().toBuffer()

  if (!config.enabled) {
    lateComposite.push({
      input: Buffer.from([0, 0, 0, 180]),
      raw: { width: 1, height: 1, channels: 4 },
      tile: true,
    })
  }
  const resizeImage = sharp(buffer, {
    raw: { width: size, height: size, channels: 4 },
  })
    .composite(lateComposite)
    .resize(outputWidth, outputHeight, { kernel: 'cubic' })
    .raw()

  if (columns > 1 || rows > 1) {
    const grid = []
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        grid.push(
          resizeImage
            .extract({
              left: i * outputSize,
              top: j * outputSize,
              width: outputSize,
              height: outputSize,
            })
            .toBuffer()
        )
      }
    }

    return Promise.all(grid)
  }

  const outputBuffer = await resizeImage.toBuffer()
  return [outputBuffer]
  // return Promise.all([image.toBuffer()])
}

const createObjectKey = (config) => {
  return JSON.stringify(config)
}

// eager load conditional computed values for caching/reactivity
const effectiveConfig = (config, computed) => {
  const newConfig = { ...config }

  Object.entries(computed).forEach(([name, computed]) => {
    newConfig[name] = computed.value
  })
  return newConfig
}

const withCache = async (key, callback) => {
  if (cache[key]) {
    return cache[key]
  }
  const result = await callback()
  cache[key] = result
  return result
}

export default (config, computed) => {
  const combinedConfig = effectiveConfig(config, computed)
  const key = createObjectKey(combinedConfig)
  return withCache(key, () => getRender(combinedConfig))
}
