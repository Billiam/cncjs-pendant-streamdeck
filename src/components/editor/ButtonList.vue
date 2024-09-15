<script>
import { useButtonStore } from '@/stores/buttons'
import { useVmodel } from '@/lib/v-model'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import AutoComplete from 'primevue/autocomplete'
import Select from 'primevue/select'

import FilterSelect from './FilterSelect.vue'
</script>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    require: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const { model } = useVmodel(props, emits)

const buttonStore = useButtonStore()
const ui = useUiStore()

const { buttons } = storeToRefs(buttonStore)

const buttonNames = computed(() => Object.keys(buttons.value).sort())
const filteredButtons = ref([])

const visible = ref(true)
const search = ({ query }) => {
  if (query.trim() === '') {
    filteredButtons.value = [...buttonNames.value]
  }
  const lowerQuery = query.toLowerCase()

  filteredButtons.value = buttonNames.value.filter((name) =>
    name.toLowerCase().includes(lowerQuery)
  )
  return filteredButtons
}
</script>

<template>
  <label class="label">Button name</label>
  <Select editable v-model="model" :options="buttonNames" fluid></Select>
</template>

<style scoped>
.p-select {
  display: flex;
  margin-bottom: 8px;
}
</style>
