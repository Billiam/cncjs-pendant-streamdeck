<script>
import { useCncStore } from '@/stores/cnc'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'

import Select from 'primevue/select'
</script>

<script setup>
const cnc = useCncStore()
const ui = useUiStore()
const gcode = useGcodeStore()

const options = [cnc, gcode, ui].reduce((list, store) => {
  const children = []
  const label = store.$id
  const storeGroup = { label, children }

  list.push(storeGroup)

  const parseValue = (list, parent, key, value) => {
    if (key.startsWith('_')) {
      return
    }
    const parentKey = `${parent}.${key}`

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([k, v]) => {
        parseValue(list, parentKey, k, v)
      })
      return
    }

    list.push(parentKey)
  }

  Object.entries(store)
    .filter(([key]) => /^[^_$]/.test(key))
    .filter(([_key, value]) => typeof value !== 'function')
    .forEach(([key, value]) => {
      parseValue(children, label, key, value)
    })

  children.sort()

  return list
}, [])
</script>

<template>
  <Select
    :options="options"
    optionGroupLabel="label"
    optionGroupChildren="children"
    placeholder="Add a variable"
    filter
    autoFilterFocus
    class="variable-select"
  />
</template>

<style scoped>
.variable-select {
  margin-top: 0.5rem;
}
</style>
