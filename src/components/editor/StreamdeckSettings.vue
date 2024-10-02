<script>
import { storeToRefs } from 'pinia'
import { computed, toRef } from 'vue'

import { useUiStore } from '@/stores/ui'

import Button from 'primevue/button'
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'

import ColorPicker from '@/components/editor/ColorPicker.vue'
import FontSelect from '@/components/editor/FontSelect.vue'
import ToggleSetting from '@/components/editor/ToggleSetting.vue'
</script>

<script setup>
const ui = useUiStore()
const { streamdeckConfig: sd, streamdeckOverride } = storeToRefs(ui)

const proxySetting = (key) => {
  return computed({
    get() {
      if (sd.value[key] != null) {
        return sd.value[key]
      }
      return ui[`_${key}`]
    },
    set(value) {
      sd.value[key] = value
    },
  })
}
const childProxySetting = (key, subkey) => {
  return computed({
    get() {
      if (sd.value[key] != null) {
        return sd.value[key][subkey]
      }
      return ui[`_${key}`][subkey]
    },
    set(value) {
      if (sd.value[key] == null) {
        sd.value[key] = {}
      }
      sd.value[key][subkey] = value
    },
  })
}

const rows = proxySetting('rows')
const columns = proxySetting('columns')
const palette = proxySetting('palette')
const bgColor = proxySetting('bgColor')
const progressColor = proxySetting('progressColor')
const textColor = proxySetting('textColor')
const gcodeColors = proxySetting('gcodeColors')
const font = proxySetting('font')
const fontSize = proxySetting('fontSize')
const lineHeight = proxySetting('lineHeight')

const g0 = childProxySetting('gcodeColors', 'G0')
const g1 = childProxySetting('gcodeColors', 'G1')
const g2g3 = childProxySetting('gcodeColors', 'G2G3')

const addColor = () => {
  if (sd.value.palette == null) {
    sd.value.palette = [...ui._palette]
  }
  palette.value.push('#000000')
}
</script>

<template>
  <Fieldset legend="Button layout">
    <toggle-setting v-model="streamdeckOverride.rows" v-slot="{ enabled }">
      <div class="flex-row">
        <InputGroup>
          <InputNumber v-model="rows" :disabled="!enabled" />
          <InputGroupAddon>rows</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputNumber v-model="columns" :disabled="!enabled" />
          <InputGroupAddon>columns</InputGroupAddon>
        </InputGroup>
      </div>
    </toggle-setting>
  </Fieldset>

  <Fieldset legend="Theme">
    <span class="label">Palette </span>
    <div class="form-row">
      <toggle-setting v-model="streamdeckOverride.palette" v-slot="{ enabled }">
        <div class="flex-center flex-row flex-wrap">
          <input
            type="color"
            class="palette-color"
            v-for="(color, index) in palette"
            :value="color"
            :key="index"
            :disabled="!enabled"
            @change="(event) => (palette[index] = event.target.value)"
            :title="index"
          />
          <Button @click="addColor" :disabled="!enabled">Add color</Button>
        </div>
      </toggle-setting>
    </div>

    <div class="form-row">
      <label class="label">Background color</label>
      <toggle-setting v-model="streamdeckOverride.bgColor" v-slot="{ enabled }">
        <color-picker v-model="bgColor" :disabled="!enabled" />
      </toggle-setting>
    </div>

    <div class="form-row">
      <label class="label">Progress animation color</label>
      <toggle-setting
        v-model="streamdeckOverride.progressColor"
        v-slot="{ enabled }"
      >
        <color-picker v-model="progressColor" :disabled="!enabled" />
      </toggle-setting>
    </div>

    <div class="form-row">
      <label class="label">Text color</label>
      <toggle-setting
        v-model="streamdeckOverride.textColor"
        v-slot="{ enabled }"
      >
        <color-picker v-model="textColor" :disabled="!enabled" />
      </toggle-setting>
    </div>
  </Fieldset>

  <Fieldset legend="Gcode colors">
    <div class="form-row">
      <label class="label">Rapid moves</label>
      <toggle-setting
        v-model="streamdeckOverride.gcodeColors"
        v-slot="{ enabled }"
      >
        <input type="color" v-model="g0" :disabled="!enabled" />
      </toggle-setting>
    </div>
    <div class="form-row">
      <label class="label">Feed moves</label>
      <toggle-setting
        v-model="streamdeckOverride.gcodeColors"
        v-slot="{ enabled }"
      >
        <input type="color" v-model="g1" :disabled="!enabled" />
      </toggle-setting>
    </div>
    <div class="form-row">
      <label class="label">Curve moves</label>
      <toggle-setting
        v-model="streamdeckOverride.gcodeColors"
        v-slot="{ enabled }"
      >
        <input type="color" v-model="g2g3" :disabled="!enabled" />
      </toggle-setting>
    </div>
  </Fieldset>

  <Fieldset legend="Text">
    <div class="form-row">
      <label class="label">Font</label>
      <toggle-setting v-model="streamdeckOverride.font" v-slot="{ enabled }">
        <font-select v-model="font" :disabled="!enabled" />
      </toggle-setting>
    </div>

    <div class="form-row">
      <label class="label">Font size</label>
      <toggle-setting
        v-model="streamdeckOverride.fontSize"
        v-slot="{ enabled }"
      >
        <InputNumber
          v-model="fontSize"
          :minFractionDigits="0"
          :maxFractionDigits="2"
          :disabled="!enabled"
        />
      </toggle-setting>
    </div>

    <div class="form-row">
      <label class="label">Line height</label>
      <toggle-setting
        v-model="streamdeckOverride.lineHeight"
        v-slot="{ enabled }"
      >
        <InputNumber
          v-model="lineHeight"
          :minFractionDigits="0"
          :maxFractionDigits="2"
          :disabled="!enabled"
        />
      </toggle-setting>
    </div>
  </Fieldset>
</template>
<script setup></script>

<style scoped>
.flex-row {
  padding-bottom: 0;
  margin-bottom: 0;
}
</style>
