import { computed, ref, watch } from 'vue'

export default (getter) => {
  const computedValue = computed(getter)
  const refValue = ref()
  watch(
    computedValue,
    (newValue) => {
      refValue.value = newValue
    },
    { immediate: true }
  )
  return refValue
}
