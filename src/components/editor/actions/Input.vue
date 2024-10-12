<script>
import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import InputText from 'primevue/inputtext'
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

const option0 = itemModel(0)
</script>

<template>
  <label class="label">Text</label>
  <InputText v-model="option0" required fluid></InputText>
</template>
