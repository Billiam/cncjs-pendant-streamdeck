import { computed, defineEmits, defineProps } from 'vue'

export const useVmodel = (props, emits, defaultValue = null) => {
  const model = computed({
    get() {
      return props.modelValue ?? defaultValue
    },
    set(value) {
      emits('update:modelValue', value)
    },
  })

  return { model }
}
