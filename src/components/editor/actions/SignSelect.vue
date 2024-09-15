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

const options = ['+', '-']
</script>

<template>
  <label class="label">Direction</label>
  <SelectButton v-model="model" :options="options" aria-labelledby="basic" />
</template>
