<script>
import { storeToRefs } from 'pinia'

import { useArrayVmodel } from '@/lib/array-v-model'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'

import Select from 'primevue/select'
</script>

<script setup>
import { storeToRefs } from 'pinia'

const sceneStore = useScenesStore()
const buttonStore = useButtonStore()

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})
const { _userFlags: userFlags } = storeToRefs(buttonStore)

const { itemModel } = useArrayVmodel(props, emits)
const option0 = itemModel(0)
</script>

<template>
  <label class="label">User flag name</label>
  <Select v-model="option0" :options="userFlags" fluid editable></Select>
</template>
