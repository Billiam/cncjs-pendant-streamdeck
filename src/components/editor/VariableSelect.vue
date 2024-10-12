<script>
import { computed } from 'vue'

import { useCncStore } from '@/stores/cnc'
import { useGcodeStore } from '@/stores/gcode'
import { useUiStore } from '@/stores/ui'

import Select from 'primevue/select'
</script>

<script setup>
import { useButtonStore } from '@/stores/buttons'

const cnc = useCncStore()
const ui = useUiStore()
const gcode = useGcodeStore()
const buttons = useButtonStore()

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

const options = computed(() => {
  return [cnc, gcode, ui].reduce((list, store) => {
    const children = []
    const label = store.$id
    const storeGroup = { label, children }

    list.push(storeGroup)

    Object.entries(store)
      .filter(([key]) => /^[^_$]/.test(key))
      .filter(([_key, value]) => typeof value !== 'function')
      .forEach(([key, value]) => {
        parseValue(children, label, key, value)
      })

    if (label === 'ui') {
      const userFlags = buttons._userFlags
      userFlags.forEach((flag) => {
        parseValue(children, 'ui.userFlags', flag, null)
      })
    }

    children.sort()

    return list
  }, [])
})
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
