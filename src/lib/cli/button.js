import { useText } from '@/lib/cell/text'
import { useVisibility } from '@/lib/cell/visibility'
import CliButtonHandler from '@/lib/cli/button-handler'
import buttonRenderer from '@/lib/cli/button-renderer'
import { useColor } from '@/lib/cell/color'
import { computed, ref, watchEffect } from 'vue'

export default class CliButton {
  constructor(index, config, buttonActions) {
    this.index = index
    this.config = config
    this.buffers = Array.from(
      Array((config.rows ?? 1) * (config.columns ?? 1))
    ).map(() => ref())
    this.buttonActions = buttonActions
    this.setup()
  }

  down() {
    this.buttonHandler.down()
  }

  up() {
    this.buttonHandler.up()
  }

  cleanup() {
    this.buttonHandler.cleanup()
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

    this.buttonHandler = new CliButtonHandler(
      this.config.actions,
      this.buttonActions
    )

    const { show, enabled } = useVisibility(this.config, this.buttonActions)
    this.show = show

    const color = computed(() => {
      let color
      if (enabled.value) {
        if (this.buttonHandler.active.value) {
          color = cellActiveColor.value
        } else {
          color = cellBgColor.value
        }
      }
      return color ?? '#000'
    })

    this.show = show

    watchEffect(() => {
      buttonRenderer(
        { ...this.config, index: this.index },
        {
          color,
          cellProgressColor,
          cellTextColor,
          contrastingTextColor,
          enabled,
          fontSize,
          textSvgAlignment,
          textSvgVerticalAlignment,
          textLines,
          show,
        }
      ).then((newBuffers) => {
        this.buffers.forEach((buffer, i) => {
          buffer.value = newBuffers[i] || null
        })
      })
    })
  }
}
