import { useText } from '@/lib/cell/text'
import { useVisibility } from '@/lib/cell/visibility'
import CliButtonHandler from '@/lib/cli/button-handler'
import buttonRenderer from '@/lib/cli/button-renderer'
import animation from '@/lib/cli/animate'
import Canvas from '@/lib/cli/canvas'
import { useColor } from '@/lib/cell/color'
import { useGcode } from '@/lib/cell/gcode'
import { computed, ref, watch, watchEffect } from 'vue'
import { renderToolpath } from '@/lib/gcode-renderer'
import { performance } from 'adapter'

export default class CliButton {
  constructor(index, config, { size, buttonActions, iconDirectory }) {
    this.index = index
    this.config = config
    this.buffers = Array.from(
      Array((config.rows ?? 1) * (config.columns ?? 1))
    ).map(() => ref())
    this.size = size
    this.buttonActions = buttonActions
    this.iconDirectory = iconDirectory
    this.watchers = []
    this.drawTime = 0
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

  watch(key, callback) {
    this.watchers.push(watch(key, callback))
  }

  watchEffect(callback) {
    this.watchers.push(watchEffect(callback))
  }

  setup() {
    const { cellBgColor, cellProgressColor, cellActiveColor } = useColor(
      this.config
    )

    const {
      cellTextColor,
      contrastingTextColor,
      font,
      lineHeight,
      svgFontSize: fontSize,
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
    const { renderGcode, gcodeColors } = useGcode(this.config)
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
    const holdPercent = ref(0)
    let holdAnimation

    this.watch(this.buttonHandler.holding, (holding) => {
      if (holdAnimation) {
        holdAnimation.cancel()
        holdAnimation = null
        holdPercent.value = 0
      }
      if (holding) {
        holdAnimation = animation(400, 60, (percent) => {
          holdPercent.value = percent
        })
        holdAnimation.delay(100)
      }
    })

    const gcodeLine = ref()
    const updateGcodeLine = (index) => {
      gcodeLine.value = index
    }

    if (this.config.type === 'gcodePreview') {
      this.watchEffect((onInvalidate) => {
        this.canvas = new Canvas(width - 10, height - 10)

        if (!renderGcode.value) {
          return
        }
        let halt = false
        onInvalidate(() => {
          halt = true
        })
        const halted = () => halt

        const settings = {
          animate: this.config.animated,
          lineWidth: this.canvas.lineWidth,
          autosize: false,
          colors: gcodeColors.value,
        }
        renderToolpath(
          this.canvas.canvas,
          renderGcode.value,
          settings,
          updateGcodeLine,
          halted
        )
      })
    }

    this.show = show

    this.watchEffect(() => {
      const time = performance.now()
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
          lineHeight,
          font,
          fontSize,
          gcodeLine,
          holdPercent,
          renderGcode,
          textSvgAlignment,
          textSvgVerticalAlignment,
          textLines,
          show,
        },
        this.canvas,
        this.iconDirectory
      ).then((newBuffers) => {
        if (time < this.drawTime) {
          return
        }
        this.drawTime = time
        this.buffers.forEach((buffer, i) => {
          buffer.value = newBuffers[i] || null
        })
      })
    })
  }
}
