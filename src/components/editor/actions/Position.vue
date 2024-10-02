<script>
import { computed, watch } from 'vue'

import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'
</script>

<script setup>
const sceneStore = useScenesStore()

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})
const { proxy, itemModel } = useArrayVmodel(props, emits)

const asPercent = (index) => {
  const model = itemModel(index)

  return computed({
    get() {
      if (model.value != null) {
        return model.value.toString().replace(/%$/, '')
      }
      return model.value
    },
    set(value) {
      if (value != null && !value.toString().endsWith('%')) {
        model.value = `${value}%`
        return
      }
      model.value = value
    },
  })
}

const inputs = Object.freeze([
  { label: 'x', model: asPercent(0) },
  { label: 'y', model: asPercent(1) },
  { label: 'z', model: asPercent(2) },
  { label: 'a', model: asPercent(3) },
  { label: 'b', model: asPercent(4) },
  { label: 'c', model: asPercent(5) },
])

const migrateInputs = () => {
  inputs.forEach((input) => {
    if (
      input.model.value != null &&
      !input.model.value.toString().endsWith('%')
    ) {
      input.model.value = null
    }
  })
}

watch(
  proxy,
  () => {
    migrateInputs()
  },
  { immediate: true },
)
</script>

<template>
  <label class="label">New position</label>
  <InputGroup v-for="input in inputs" fluid class="mb-1">
    <InputGroupAddon>{{ input.label }}</InputGroupAddon>
    <InputNumber v-model="input.model.value" />
    <InputGroupAddon>%</InputGroupAddon>
  </InputGroup>
</template>

<style scoped>
.mb-1 {
  margin-bottom: 1rem;
}
</style>
