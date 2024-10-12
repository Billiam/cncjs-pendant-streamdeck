import { computed } from 'vue'

import { useEvaluate } from './evaluate'
import watchCompute from '@/lib/watch-compute'

export const useVisibility = (config, buttonActions) => {
  const { scopedEvaluate } = useEvaluate()

  const show = watchCompute(
    () => !config.value.if || !!scopedEvaluate(config.value.if),
  )

  const configDisabled = computed(
    () => config.value.disabled && !!scopedEvaluate(config.value.disabled),
  )

  const enabled = watchCompute(
    () =>
      !configDisabled.value &&
      buttonActions.value?.enabled(config.value.actions),
  )
  return { enabled, show }
}
