<script>
import schema from 'cncjs-pendant-streamdeck-validator/dist/config.schema.json'

import { useArrayVmodel } from '@/lib/array-v-model'

import SelectButton from 'primevue/selectbutton'

const rapidSpeeds = schema.actionSchemas.rapids.properties.arguments.items.enum
</script>

<script setup>
const options = rapidSpeeds.map((value) => ({
  value,
  label: `${value}%`,
}))

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
  <label class="label">Rapids</label>
  <SelectButton
    :options="options"
    optionLabel="label"
    optionValue="value"
    v-model="model"
    fluid
    required
  ></SelectButton>
</template>
