<script>
import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import SceneSelect from './SceneSelect.vue'
import SpindleDirSelect from './SpindleDirSelect.vue'
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

const defaultScene = sceneStore.scene('numpad')
  ? 'numpad'
  : sceneStore.sceneNames[0]

const dirOption = itemModel(0, 'CW')
const sceneOption = itemModel(1, defaultScene)
</script>

<template>
  <spindle-dir-select v-model="dirOption" required></spindle-dir-select>
  <scene-select v-model="sceneOption" required></scene-select>
</template>
