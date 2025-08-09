<script>
import { useVmodel } from '@/lib/v-model'

import SelectButton from 'primevue/selectbutton'
</script>
<script setup>
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true,
  },
})
const { model } = useVmodel(props, emits)

const options = [
  { label: 'Clockwise (M3)', value: 'CW' },
  { label: 'Counter clockwise (M4)', value: 'CCW' },
]
</script>

<template>
  <label class="label">Direction</label>
  <SelectButton
    v-model="model"
    :options="options"
    optionLabel="label"
    optionValue="value"
    aria-labelledby="basic"
  />
</template>
