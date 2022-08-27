import { useUiStore } from '@/stores/ui'
import tinycolor from 'tinycolor2'

export default () => {
  const ui = useUiStore()

  const normalizeColor = (color) => {
    if (typeof color === 'number') {
      return ui.palette[color]
    }
    return color
  }

  const highlightColor = (color) => {
    const amount = ui.isWeb ? 10 : 20

    const normalized = tinycolor(normalizeColor(color))
    if (normalized.isDark()) {
      return normalized.brighten(amount).toHexString()
    } else {
      return normalized.darken(amount).toHexString()
    }
  }

  const contrastColor = (color) => {
    return tinycolor(color).isLight() ? '#000' : '#fff'
  }

  return {
    highlightColor,
    normalizeColor,
    contrastColor,
  }
}
