import sharp from 'sharp'
import fs from 'fs'
let canvas
let isNodeCanvas = false
let isPureImage = false

try {
  canvas = require('canvas')
  isNodeCanvas = true
} catch (e) {}

if (!canvas) {
  try {
    canvas = require('pureimage')
    isPureImage = {}
  } catch (e) {
    canvas = {}
  }
}

class nodeCanvas {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.canvas = canvas.createCanvas(width, height)
  }
  dimensions() {
    return { width: this.canvas.width, height: this.canvas.height }
  }
  buffer() {
    return this.canvas.toBuffer()
  }
}

class pureImage {
  constructor(width, height, scale = 2) {
    this.width = width
    this.height = height
    this.scale = scale
    this.lineWidth = 1.01
    this.canvas = canvas.make(width * this.scale, height * this.scale)
  }

  dimensions() {
    return {
      width: this.canvas.width / this.scale,
      height: this.canvas.height / this.scale,
    }
  }
  async buffer() {
    const PassThrough = require('stream').PassThrough
    const passThroughStream = new PassThrough()
    const pngData = []
    passThroughStream.on('data', (chunk) => pngData.push(chunk))
    passThroughStream.on('end', () => {})
    await canvas.encodePNGToStream(this.canvas, passThroughStream)
    await canvas.encodePNGToStream(
      this.canvas,
      fs.createWriteStream('canvas.png')
    )
    return sharp(Buffer.concat(pngData))
      .resize({
        width: this.width,
        height: this.height,
        fit: 'contain',
        kernel: 'cubic',
      })
      .toBuffer()
  }
}

class noop {
  constructor(width, height) {
    this.width = width
    this.height = height
    console.warn(
      'Requested a new canvas but pureimage or node-canvas are not installed'
    )
  }

  buffer() {
    return null
  }
}
let CanvasImplementation = noop
if (isNodeCanvas) {
  CanvasImplementation = nodeCanvas
} else if (isPureImage) {
  CanvasImplementation = pureImage
}

export default CanvasImplementation
