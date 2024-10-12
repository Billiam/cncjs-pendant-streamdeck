<script>
import { useArrayVmodel } from '@/lib/array-v-model'

import AdjustSelect from './AdjustSelect.vue'
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

const option0 = itemModel(0, '+')
</script>

<template>
  <label class="label">Change jog distance</label>
  <adjust-select v-model="option0"></adjust-select>
</template>
