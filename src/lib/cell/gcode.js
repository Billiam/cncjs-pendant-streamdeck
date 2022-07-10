import { useGcodeStore } from '@/stores/gcode'
import { computed } from 'vue'

export const useGcode = (config) => {
  const gcode = useGcodeStore()

  const renderGcode = computed(
    () => config.type === 'gcodePreview' && gcode.geometry
  )

  return { renderGcode }
}
