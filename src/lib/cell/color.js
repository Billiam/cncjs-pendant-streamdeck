import { useUiStore } from '@/stores/ui'
import Color from '@/lib/color'
import { computed } from 'vue'

export const useColor = (config) => {
  const ui = useUiStore()
  const color = Color()

  // color configuration
  const cellBgColor = computed(() =>
    color.normalizeColor(config.bgColor || ui.bgColor)
  )
  const cellProgressColor = computed(() =>
    color.normalizeColor(ui.progressColor)
  )

  const cellActiveColor = computed(() =>
    color.highlightColor(cellBgColor.value)
  )

  return { cellBgColor, cellProgressColor, cellActiveColor }
}
