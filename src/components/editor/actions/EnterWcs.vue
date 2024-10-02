<script>
import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import AxisSelect from './AxisSelect.vue'
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

const defaultValue = sceneStore.scene('numpad')
  ? 'numpad'
  : sceneStore.sceneNames[0]

const option0 = itemModel(0, 'x')
const option1 = itemModel(1, defaultValue)
</script>

<template>
  <axis-select v-model="option0" required></axis-select>
  <scene-select v-model="option1" required></scene-select>
</template>
