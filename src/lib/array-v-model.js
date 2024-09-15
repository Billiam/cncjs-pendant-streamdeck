import { computed, ref, watch, onMounted } from 'vue'

export const useArrayVmodel = (props, emits) => {
  const proxy = ref(props.modelValue)

  watch(
    props.modelValue,
    () => {
      proxy.value = [...(props.modelValue ?? [])]
    },
    { immediate: true }
  )

  const itemModel = (index, initialValue = null) => {
    const model = computed({
      get() {
        return proxy.value[index]
      },
      set(value) {
        proxy.value[index] = value
        emits('update:modelValue', proxy.value)
      },
    })

    if (initialValue != null) {
      onMounted(() => {
        if (model.value == null) {
          model.value = initialValue
        }
      })
    }
    return model
  }

  return { proxy, itemModel, emits, props }
}
