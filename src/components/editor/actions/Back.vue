<script>
import { computed } from 'vue'

import { useArrayVmodel } from '@/lib/array-v-model'

import InputNumber from 'primevue/inputnumber'
</script>

<script setup>
const emits = defineEmits(['update:modelValue'])
const props = defineProps(['modelValue'])
const { itemModel } = useArrayVmodel(props, emits)

const option0 = itemModel(0)
const stringWrapper = computed({
  get() {
    if (option0.value !== '' && option0.value != null) {
      return parseInt(option0.value)
    }
  },
  set(integer) {
    option0.value = integer == null ? integer : integer.toString()
  },
})
</script>

<template>
  <label class="label">Back count</label>
  <InputNumber :min="1" fluid v-model="stringWrapper"></InputNumber>
</template>
