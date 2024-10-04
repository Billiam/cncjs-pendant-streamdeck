import tinycolor from 'tinycolor2'

import { useUiStore } from '@/stores/ui'

export default () => {
  const ui = useUiStore()

  const normalizeColor = (color) => {
    if (typeof color === 'number') {
      return ui.palette[color]
    }
    return color
  }

  const findColor = (color) => {
    if (typeof color === 'number') {
      return color
    }
    const lowerColor = color.toLowerCase()

    const palette = Object.keys(ui.palette).find(
      (key) => ui.palette[key].toLowerCase() === lowerColor,
    )
    if (palette != null) {
      return palette * 1
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
    return tinycolor(color).isLight() ? '#000000' : '#ffffff'
  }

  return {
    highlightColor,
    normalizeColor,
    findColor,
    contrastColor,
  }
}
