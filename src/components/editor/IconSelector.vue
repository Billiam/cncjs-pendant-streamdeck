<script>
import debounce from 'lodash/debounce'
import { computed, ref, watch } from 'vue'

import iconlist from '@/lib/iconlist.json'

import InputText from 'primevue/inputtext'
</script>
<script setup>
defineProps({
  modelValue: {
    type: String,
  },
})
const emits = defineEmits(['update:modelValue'])
const emit = (value) => emits('update:modelValue', value)

const icons = Object.freeze(
  Object.entries(iconlist).flatMap(([key, icons]) =>
    icons.map((icon) => `${key}/${icon}`),
  ),
)

const input = ref('')
const debouncedInput = ref('')

const groupFilter = ref('')

watch(
  input,
  debounce(() => {
    debouncedInput.value = input.value
  }, 300),
)
const groups = Object.keys(iconlist)

const filteredIcons = computed(() => {
  if (!debouncedInput.value && !groupFilter.value) {
    return icons
  }
  const search = debouncedInput.value

  return icons.filter((icon) => {
    const split = icon.split('/')
    return (
      (groupFilter.value === '' || split[0] === groupFilter.value) &&
      (search === '' || split[1].includes(search))
    )
  })
})
</script>
<template>
  <div class="wrapper">
    <div class="fixed">
      <InputText v-model="input" fluid placeholder="Filter icons"></InputText>
    </div>
    <div class="icons">
      <img
        v-for="icon in filteredIcons"
        @click="emit(icon)"
        :class="{ active: modelValue === icon }"
        :alt="icon"
        :title="icon"
        v-memo="[modelValue === icon]"
        width="30"
        height="30"
        :key="icon"
        :src="`icons/${icon}`"
      />
    </div>
  </div>
</template>

<style scoped>
.active {
  background-color: var(--color-highlight);
}
.wrapper {
  position: relative;
  width: 100%;
}
.fixed {
  top: 0;
  position: sticky;
  z-index: 50;
  padding-bottom: 2rem;
  background-color: var(--p-drawer-background);
}
</style>
