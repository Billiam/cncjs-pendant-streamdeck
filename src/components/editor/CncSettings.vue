<script>
import { storeToRefs } from 'pinia'
import { computed, inject, watch } from 'vue'

import { useCncStore } from '@/stores/cnc'

import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Slider from 'primevue/slider'
</script>

<script setup>
const { axes, axisSpeeds } = storeToRefs(useCncStore())

const axisPercent = (axis) => {
  return computed({
    get() {
      if (axisSpeeds.value[axis] != null) {
        return axisSpeeds.value[axis] * 100
      }
      return 100
    },
    set(value) {
      if (value == null) {
        delete axisSpeeds.value[axis]
      } else {
        axisSpeeds.value[axis] = value / 100.0
      }
    },
  })
}
const axisList = Object.freeze(['x', 'y', 'z', 'a', 'b', 'c'])

const axisModels = Object.freeze(
  axisList.map((axis) => ({
    label: axis,
    model: axisPercent(axis),
  })),
)
const ax = axisPercent('x')
const y = { x: ax }
</script>

<template>
  <Fieldset legend="Machine">
    <label class="label">Supported axes</label>
    <SelectButton v-model="axes" :options="axisList" multiple />
  </Fieldset>

  <Fieldset legend="Axis smooth jog speeds">
    <div v-for="axis in axisModels">
      <InputGroup>
        <InputGroupAddon>{{ axis.label }}</InputGroupAddon>
        <InputNumber v-model="axis.model.value" />
        <InputGroupAddon>%</InputGroupAddon>
      </InputGroup>
    </div>
  </Fieldset>
</template>

<style scoped>
.current-url {
  margin-left: 1rem;
}
.status-icon {
  max-width: 100px;
  border-radius: 50%;
}
.icon-bad {
  background-color: #b71138;
}
.icon-ok {
  background-color: #06d6a0;
}
.status {
}
.form-columns {
  justify-content: space-between;
}
</style>
