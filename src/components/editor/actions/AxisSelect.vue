<script>
import { useVmodel } from '@/lib/v-model'

import SelectButton from 'primevue/selectbutton'
</script>

<script setup>
const axes = ['x', 'y', 'z', 'a', 'b', 'c']
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const { model } = useVmodel(props, emits)
</script>

<template>
  <label class="label">Axis</label>
  <SelectButton v-model="model" :options="axes" aria-labelledby="basic" />
</template>
