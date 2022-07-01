import { useCncStore } from '@/stores/cnc'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'
import evaluate from 'simple-evaluate'

export const useEvaluate = () => {
  const cnc = useCncStore()
  const ui = useUiStore()
  const gcode = useGcodeStore()

  const scopedEvaluate = (str) => evaluate({ cnc, ui, gcode }, str)

  return { scopedEvaluate }
}
