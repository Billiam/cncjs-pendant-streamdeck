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

const commandList = ref(null)
cnc.listCommands().then((commands) => {
  commandList.value = Object.entries(commands)
})

const commandId = itemModel(0)
const commandName = itemModel(1)

const { uuidArray } = useUuidModel(commandId, commandName)
</script>

<template>
  <label class="label">Commands</label>
  <Select
    v-model="uuidArray"
    v-bind="$attrs"
    :options="commandList"
    optionValue="1"
    optionLabel="0"
    editable
    fluid
    filter
  ></Select>
</template>
