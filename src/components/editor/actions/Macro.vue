<script>
import { ref } from 'vue'

import { useUuidModel } from '@/lib/editor/uuid-model'
import { useArrayVmodel } from '@/lib/array-v-model'
import { useCncStore } from '@/stores/cnc'

import Select from 'primevue/select'
</script>

<script setup>
const cnc = useCncStore()

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})
const { itemModel } = useArrayVmodel(props, emits)

const macroList = ref(null)
cnc.listMacros().then((macros) => {
  macroList.value = Object.entries(macros)
})

const macroId = itemModel(0)
const macroName = itemModel(1)

const { uuidArray } = useUuidModel(macroId, macroName)
</script>

<template>
  <label class="label">Commands</label>
  <Select
    v-model="uuidArray"
    v-bind="$attrs"
    :options="macroList"
    optionValue="1"
    optionLabel="0"
    editable
    fluid
    filter
  ></Select>
</template>
