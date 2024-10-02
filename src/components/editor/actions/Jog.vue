<script>
import { defineEmits, defineProps } from 'vue'

import { useArrayVmodel } from '@/lib/array-v-model'

import AxisSelect from './AxisSelect.vue'
import SceneSelect from './SceneSelect.vue'
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

const signModel = itemModel(0, '+')
const axisModel = itemModel(1, 'x')
</script>

<template>
  <sign-select v-model="signModel"></sign-select>
  <axis-select v-model="axisModel"></axis-select>
</template>
