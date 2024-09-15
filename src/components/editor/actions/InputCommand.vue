<script>
import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import schema from 'cncjs-pendant-streamdeck-validator/dist/config.schema.json'
const inputCommands =
  schema.actionSchemas.inputCommand.properties['arguments'].items[0].enum

import Select from 'primevue/select'
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
const { itemModel } = useArrayVmodel(props, emits)

const option0 = itemModel(0, 'backspace')
</script>

<template>
  <label class="label">Command</label>
  <Select :options="inputCommands" v-model="option0" required fluid></Select>
</template>
