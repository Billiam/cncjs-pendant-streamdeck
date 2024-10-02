<script>
import { ref } from 'vue'

import { useVmodel } from '@/lib/v-model'

import Checkbox from 'primevue/checkbox'
</script>

<script setup>
const props = defineProps({
  modelValue: {
    require: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const { model } = useVmodel(props, emits)
</script>

<template>
  <div class="toggle-row flex-stretch flex-row">
    <div class="column checkbox">
      <Checkbox v-model="model" binary></Checkbox>
    </div>
    <div class="setting column" :class="{ disabled: !model }">
      <slot :enabled="model"></slot>
    </div>
  </div>
</template>

<style scoped>
.toggle-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.checkbox {
  border-right: 1px solid #333;
  padding-right: 10px;
  align-items: center;
  display: flex;
}
.setting {
  transition: opacity 0.2s;
}
.disabled {
  opacity: 0.5;
}
</style>
