<script>
import { useScenesStore } from '@/stores/scenes'
import { useVmodel } from '@/lib/v-model'
import { storeToRefs } from 'pinia'

import Select from 'primevue/select'
</script>
<script setup>
const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const { model } = useVmodel(props, emits)

const sceneStore = useScenesStore()
const { sceneNames } = storeToRefs(sceneStore)
</script>

<template>
  <label class="label">Scene</label>
  <Select
    v-model="model"
    v-bind="$attrs"
    :options="sceneNames"
    fluid
    filter
  ></Select>
</template>
