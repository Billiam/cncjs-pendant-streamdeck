<script>
import { useArrayVmodel } from '@/lib/array-v-model'

import InputNumber from 'primevue/inputnumber'
</script>

<script setup>
const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})
const { itemModel } = useArrayVmodel(props, emits)

const option0 = itemModel(0)
</script>

<template>
  <label class="label">Back count</label>
  <InputNumber :min="1" integeronly fluid v-model="option0"></InputNumber>
</template>
