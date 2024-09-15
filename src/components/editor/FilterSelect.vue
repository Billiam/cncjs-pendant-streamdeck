<script>
import { ref, computed, watch } from 'vue'
import debounce from 'lodash/debounce'
</script>

<script setup>
import { useVmodel } from '@/lib/v-model'

const props = defineProps({
  options: {
    type: Array,
    default: [],
  },
  modelValue: {
    required: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const { model } = useVmodel(props, emits)

const input = ref('')
const debouncedInput = ref('')

watch(
  input,
  debounce(
    () => {
      debouncedInput.value = input.value
    },
    200,
    { leading: true }
  )
)

const filteredOptions = computed(() => {
  if (!debouncedInput.value) {
    return props.options
  }
  const val = debouncedInput.value
  return props.options.filter((option) => option.includes(val))
})
</script>
<template>
  <div>
    <input type="search" class="text-input" v-model="input" />
    <select v-model="model" class="select">
      <option v-for="option in filteredOptions">
        {{ option }}
      </option>
    </select>
  </div>
</template>
