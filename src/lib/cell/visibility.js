import { computed } from 'vue'
import { useEvaluate } from './evaluate'

export const useVisibility = (config, buttonHandler) => {
  const { scopedEvaluate } = useEvaluate()

  const show = computed(() => !config.if || scopedEvaluate(config.if))

  const configDisabled = computed(
    () => config.disabled && scopedEvaluate(config.disabled)
  )

  const enabled = computed(
    () => !configDisabled.value && buttonHandler?.value.enabled(config.actions)
  )

  return { enabled, show }
}
