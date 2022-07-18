import { computed } from 'vue'
import { useEvaluate } from './evaluate'
import watchCompute from '@/lib/watch-compute'
export const useVisibility = (config, buttonActions) => {
  const { scopedEvaluate } = useEvaluate()

  const show = watchCompute(() => !config.if || !!scopedEvaluate(config.if))

  const configDisabled = computed(
    () => config.disabled && !!scopedEvaluate(config.disabled)
  )

  const enabled = watchCompute(
    () => !configDisabled.value && buttonActions.value?.enabled(config.actions)
  )
  return { enabled, show }
}
