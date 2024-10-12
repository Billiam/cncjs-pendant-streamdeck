<script>
import { useVmodel } from '@/lib/v-model'

import SelectButton from 'primevue/selectbutton'
</script>
<script setup>
const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const { model } = useVmodel(props, emits)

const options = [
  { value: '+', label: 'Increase' },
  { value: '-', label: 'Decrease' },
]
</script>

<template>
  <SelectButton
    v-model="model"
    :options="options"
    optionLabel="label"
    optionValue="value"
    aria-labelledby="basic"
  />
</template>
