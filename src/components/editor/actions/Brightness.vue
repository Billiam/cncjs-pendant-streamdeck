<script>
import { useArrayVmodel } from '@/lib/array-v-model'

import SignSelect from './SignSelect.vue'
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
  <label class="label">Brightness direction</label>
  <sign-select v-model="option0"></sign-select>
</template>
