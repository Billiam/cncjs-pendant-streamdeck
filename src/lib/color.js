import { useUiStore } from '@/stores/ui'
import tinycolor from 'tinycolor2'

export default () => {
  const { palette } = useUiStore()

  const normalizeColor = (color) => {
    if (typeof color === 'number') {
      return palette[color]
    }
    return color
  }

  const highlightColor = (color) => {
    const normalized = tinycolor(normalizeColor(color))
    if (normalized.isDark()) {
      return normalized.brighten(10).toHexString()
    } else {
      return normalized.darken(10).toHexString()
    }
  }

  return {
    highlightColor,
    normalizeColor,
  }
}
