<script>
import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import SceneSelect from './SceneSelect.vue'
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

const option0 = itemModel(0, sceneStore.sceneNames[0])
</script>

<template>
  <scene-select v-model="option0" required></scene-select>
</template>
