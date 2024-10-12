import { performance } from 'adapter'
import throttle from 'lodash/throttle'
import { computed, ref, watch, watchEffect } from 'vue'

import { useColor } from '@/lib/cell/color'
import { useGcode } from '@/lib/cell/gcode'
import { useLoading } from '@/lib/cell/loading'
import { useText } from '@/lib/cell/text'
import { useVisibility } from '@/lib/cell/visibility'
import animation from '@/lib/cli/animate'
import CliButtonHandler from '@/lib/cli/button-handler'
import buttonRenderer from '@/lib/cli/button-renderer'
import Canvas from '@/lib/cli/canvas'
import { renderToolpath } from '@/lib/gcode-renderer'
import uncompute from '@/lib/uncompute'

export default class CliButton {
  constructor(index, config, { size, buttonActions, iconDirectory, throttle }) {
    this.index = index
    this.config = config
    this.buffers = Array.from(
      Array((config.rows ?? 1) * (config.columns ?? 1)),
    ).map(() => ref())
    this.size = size
    this.buttonActions = buttonActions
    this.iconDirectory = iconDirectory
    this.watchers = []
    this.drawTime = 0
    this.throttle = throttle
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

  watch(key, callback, options = {}) {
    this.watchers.push(watch(key, callback, options))
  }

  watchEffect(callback) {
    this.watchers.push(watchEffect(callback))
  }

  setup() {
    const config = ref(this.config)

    const { cellBgColor, cellProgressColor, cellActiveColor } = useColor(config)

    const {
      cellTextColor,
      contrastingTextColor,
      font,
      lineHeight,
      svgFontSize: fontSize,
      textSvgAlignment,
      textSvgVerticalAlignment,
      textLines,
    } = useText(config)

    const width = (config.value.columns ?? 1) * this.size
    const height = (config.value.rows ?? 1) * this.size
    this.buttonHandler = new CliButtonHandler(
      config.value.actions,
      this.buttonActions,
    )
    const { renderGcode, gcodeColors } = useGcode(config)
    const { show, enabled } = useVisibility(config, this.buttonActions)
    const { loading } = useLoading(config)

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
      return color ?? '#000000'
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
        holdAnimation = animation({
          duration: 400,
          fps: 60,
          callback: (percent) => {
            holdPercent.value = percent
          },
        })
        holdAnimation.delay(100)
      }
    })

    const loadingPercent = ref(null)
    let loadingAnimation
    this.watch(
      loading,
      (current) => {
        if (loadingAnimation) {
          loadingAnimation.cancel()
          loadingAnimation = null
          loadingPercent.value = null
        }
        if (current) {
          loadingAnimation = animation({
            duration: 5000,
            fps: 60,
            loop: true,
            callback: (percent) => {
              loadingPercent.value = percent
            },
          })
          loadingAnimation.start()
        }
      },
      { immediate: !!loading.value },
    )

    const gcodeLine = ref()
    const updateGcodeLine = (index) => {
      gcodeLine.value = index
    }

    if (config.value.type === 'gcodePreview') {
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
          animate: config.value.animated,
          throttle: this.throttle,
          lineWidth: this.canvas.lineWidth,
          autosize: false,
          colors: gcodeColors.value,
        }
        renderToolpath(
          this.canvas.canvas,
          renderGcode.value,
          settings,
          updateGcodeLine,
          halted,
        )
      })
    }

    this.show = show

    const render = (time, config) => {
      buttonRenderer(config, this.canvas, this.iconDirectory).then(
        (newBuffers) => {
          if (time < this.drawTime) {
            return
          }
          this.drawTime = time
          this.buffers.forEach((buffer, i) => {
            buffer.value = newBuffers[i] || null
          })
        },
      )
    }
    const throttledRender = this.throttle
      ? throttle(render, this.throttle)
      : render

    this.watchEffect(() => {
      const time = performance.now()
      // eager load computed values for watch effect
      const effectConfig = {
        ...config.value,
        buttonSize: this.size,
        height,
        index: this.index,
        width,
        ...uncompute({
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
          loadingPercent,
          renderGcode,
          textSvgAlignment,
          textSvgVerticalAlignment,
          textLines,
          show,
        }),
      }
      throttledRender(time, effectConfig)
    })
  }
}
