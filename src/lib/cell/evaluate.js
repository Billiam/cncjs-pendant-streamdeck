import evaluate from 'simple-evaluate'

import { useCncStore } from '@/stores/cnc'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'

export const useEvaluate = () => {
  const cnc = useCncStore()
  const ui = useUiStore()
  const gcode = useGcodeStore()

  const scopedEvaluate = (str) => {
    try {
      return evaluate({ cnc, ui, gcode }, str)
    } catch (e) {
      return e.message
    }
  }

  return { scopedEvaluate }
}
