import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useGcode = (config) => {
  const gcode = useGcodeStore()
  const ui = useUiStore()

  const renderGcode = computed(
    () => config.type === 'gcodePreview' && gcode.geometry
  )

  const { gcodeColors } = storeToRefs(ui)

  return { renderGcode, gcodeColors }
}
