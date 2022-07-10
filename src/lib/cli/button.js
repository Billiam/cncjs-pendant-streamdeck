import { useText } from '@/lib/cell/text'
import { useVisibility } from '@/lib/cell/visibility'
import CliButtonHandler from '@/lib/cli/button-handler'
import buttonRenderer from '@/lib/cli/button-renderer'
import Canvas from '@/lib/cli/canvas'
import { useColor } from '@/lib/cell/color'
import { useGcode } from '@/lib/cell/gcode'
import { computed, ref, watchEffect } from 'vue'
import { renderToolpath } from '@/lib/gcode-renderer'

export default class CliButton {
  constructor(index, config, { size, buttonActions }) {
    this.index = index
    this.config = config
    this.buffers = Array.from(
      Array((config.rows ?? 1) * (config.columns ?? 1))
    ).map(() => ref())
    this.size = size
    this.buttonActions = buttonActions
    this.watchers = []
    this.setup()
  }

  down() {
    if (this.enabled.value) {
      this.buttonHandler.down()
    }
  }

  up() {
    if (this.enabled.value) {
      this.buttonHandler.up()
    }
  }

  cleanup() {
    this.buttonHandler.cleanup()
    this.watchers.forEach((watcher) => {
      watcher()
    })
  }

  setup() {
    const { cellBgColor, cellProgressColor, cellActiveColor } = useColor(
      this.config
    )

    const {
      cellTextColor,
      contrastingTextColor,
      fontSize,
      textSvgAlignment,
      textSvgVerticalAlignment,
      textLines,
    } = useText(this.config)

    const width = (this.config.columns ?? 1) * this.size
    const height = (this.config.rows ?? 1) * this.size

    this.buttonHandler = new CliButtonHandler(
      this.config.actions,
      this.buttonActions
    )
    const { renderGcode } = useGcode(this.config)
    const { show, enabled } = useVisibility(this.config, this.buttonActions)
    this.show = show
    this.enabled = enabled

    const color = computed(() => {
      let color
      if (this.enabled.value) {
        if (this.buttonHandler.active.value) {
          color = cellActiveColor.value
        } else {
          color = cellBgColor.value
        }
      }
      return color ?? '#000'
    })

    const gcodeLine = ref()
    const updateGcodeLine = (index) => {
      gcodeLine.value = index
    }
    if (this.config.type === 'gcodePreview') {
      if (!this.canvas) {
        this.canvas = new Canvas(width - 10, height - 10)
      }
      const watcher = watchEffect(() => {
        if (!renderGcode.value) {
          return
        }

        renderToolpath(
          this.canvas.canvas,
          renderGcode.value,
          { animate: this.config.animated, lineWidth: this.canvas.lineWidth },
          updateGcodeLine
        )
      })
      this.watchers.push(watcher)
    }

    this.show = show

    watchEffect(() => {
      buttonRenderer(
        {
          ...this.config,
          buttonSize: this.size,
          height,
          index: this.index,
          width,
        },
        {
          color,
          cellProgressColor,
          cellTextColor,
          contrastingTextColor,
          enabled,
          fontSize,
          gcodeLine,
          renderGcode,
          textSvgAlignment,
          textSvgVerticalAlignment,
          textLines,
          show,
        },
        this.canvas
      ).then((newBuffers) => {
        this.buffers.forEach((buffer, i) => {
          buffer.value = newBuffers[i] || null
        })
      })
    })
  }
}
