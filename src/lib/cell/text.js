import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import TextTemplate from '@/lib/text-template'
import { useGcodeStore } from '@/stores/gcode'
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import Color from '@/lib/color'

const alignment = {
  'top left': { v: 'top', h: 'left' },
  'top center': { v: 'top', h: 'center' },
  'top right': { v: 'top', h: 'right' },
  left: { v: 'center', h: 'left' },
  center: { v: 'center', h: 'center' },
  right: { v: 'center', h: 'right' },
  'bottom left': { v: 'bottom', h: 'left' },
  'bottom center': { v: 'bottom', h: 'center' },
  'bottom right': { v: 'bottom', h: 'right' },
}
const svgAlignment = {
  'top left': { v: 'text-after-edge', h: 'start' },
  'top center': { v: 'text-after-edge', h: 'middle' },
  'top right': { v: 'text-after-edge', h: 'end' },
  left: { v: 'middle', h: 'start' },
  center: { v: 'middle', h: 'middle' },
  right: { v: 'middle', h: 'end' },
  'bottom left': { v: 'text-before-edge', h: 'start' },
  'bottom center': { v: 'text-before-edge', h: 'middle' },
  'bottom right': { v: 'text-before-edge', h: 'end' },
}

export const useText = (config) => {
  const cnc = useCncStore()
  const ui = useUiStore()
  const gcode = useGcodeStore()
  const scope = { cnc, ui, gcode }

  const color = Color()
  const textTemplate = computed(() => TextTemplate(config.value.text))

  const textString = computed(() => {
    return config.value.text && textTemplate.value(scope)
  })
  const textLines = computed(() => {
    return (
      config.value.text &&
      textString.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').split('\n')
    )
  })

  const fontSize = computed(() => {
    return `${config.value.textSize ?? 1}em`
  })

  const svgFontSize = computed(() => {
    return ui.fontSize * (config.value.textSize ?? 1)
  })
  const { lineHeight, font } = storeToRefs(ui)

  const cellTextColor = computed(() => color.normalizeColor(ui.textColor))
  const contrastingTextColor = computed(() =>
    color.contrastColor(cellTextColor.value)
  )
  const textAlignment = computed(
    () => alignment[config.value.textAlignment]?.h ?? 'center'
  )
  const textVerticalAlignment = computed(
    () => alignment[config.value.textAlignment]?.v ?? 'center'
  )
  const textSvgAlignment = computed(
    () => svgAlignment[config.value.textAlignment]?.h ?? 'middle'
  )
  const textSvgVerticalAlignment = computed(
    () => svgAlignment[config.value.textAlignment]?.v ?? 'middle'
  )

  return {
    cellTextColor,
    contrastingTextColor,
    font,
    fontSize,
    lineHeight,
    svgFontSize,
    textAlignment,
    textLines,
    textString,
    textSvgAlignment,
    textSvgVerticalAlignment,
    textVerticalAlignment,
  }
}
