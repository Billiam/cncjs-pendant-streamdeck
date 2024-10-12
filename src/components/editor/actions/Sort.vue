<script>
import { useArrayVmodel } from '@/lib/array-v-model'

import Select from 'primevue/select'
</script>

<script setup>
const sortOptions = [
  { label: 'Name, A-Z', value: 'alpha_asc' },
  { label: 'Name, Z-A', value: 'alpha_desc' },
  { label: 'Created, latest first', value: 'created_desc' },
  { label: 'Modified, latest first', value: 'modified_desc' },
]
const props = defineProps({
  modelValue: {
    type: Array,
    default(prop) {
      console.warn({ prop })
      return []
    },
  },
})
const emits = defineEmits(['update:modelValue'])
const { itemModel } = useArrayVmodel(props, emits)

const model = itemModel(0)
</script>

<template>
  <label class="label">Sort</label>
  <Select
    :options="sortOptions"
    optionLabel="label"
    optionValue="value"
    v-model="model"
    fluid
    required
  ></Select>
</template>
