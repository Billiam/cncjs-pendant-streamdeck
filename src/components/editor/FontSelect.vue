<script>
import { ref } from 'vue'

import { useVmodel } from '@/lib/v-model'

import Select from 'primevue/select'

let fontPromise
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

const fontList = ref(['monospace', 'serif', 'sans-serif', 'fantasy', 'cursive'])
const fontsLoaded = ref(false)
const loadFonts = async () => {
  if (fontsLoaded.value) {
    return
  }

  if (!fontPromise) {
    fontPromise = window.queryLocalFonts()
  }

  fontsLoaded.value = true

  const fontFamilies = new Set()
  for (const font of await fontPromise) {
    if (!fontFamilies.has(font.family)) {
      fontList.value.push(font.family)
      fontFamilies.add(font.family)
    }
  }
}
</script>
<template>
  <Select
    editable
    filter
    autoFilterFocus
    :options="fontList"
    v-model="model"
    @before-show="loadFonts"
    @focus="loadFonts"
  />
</template>
