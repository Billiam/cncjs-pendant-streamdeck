import { useGcodeStore } from '@/stores/gcode'
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'
import evaluate from 'simple-evaluate'

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
