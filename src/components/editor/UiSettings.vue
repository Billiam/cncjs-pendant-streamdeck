<script>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import { useUiStore } from '@/stores/ui'

import Button from 'primevue/button'
import ContextMenu from 'primevue/contextmenu'
import Fieldset from 'primevue/fieldset'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'

import ColorPicker from '@/components/editor/ColorPicker.vue'
import FontSelect from '@/components/editor/FontSelect.vue'
</script>

<script setup>
const ui = useUiStore()
const {
  pageColor,

  _bgColor: bgColor,
  _columns: columns,
  _rows: rows,
  _font: font,
  _lineHeight: lineHeight,
  _fontSize: fontSize,
  _gcodeColors: gcodeColors,
  _palette: palette,
  _progressColor: progressColor,
  _textColor: textColor,
} = storeToRefs(ui)

const addWebColor = () => {
  palette.value.push('#000000')
}
const paletteMenu = ref()
const contextClick = (event, paletteIndex) => {
  selectedPalette.value = paletteIndex
  paletteMenu.value.show(event)
}
const selectedPalette = ref()

const deletePaletteColor = () => {
  ui.deletePalette(selectedPalette.value)
}
const paletteOptions = [
  {
    label: 'Delete',
    command: deletePaletteColor,
  },
]
</script>
<template>
  <Fieldset legend="Button layout">
    <div class="flex-row">
      <InputGroup>
        <InputNumber v-model="rows" />
        <InputGroupAddon>rows</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputNumber v-model="columns" />
        <InputGroupAddon>columns</InputGroupAddon>
      </InputGroup>
    </div>
  </Fieldset>

  <Fieldset legend="Theme">
    <span class="label">Palette</span>
    <div class="form-row flex-row flex-center flex-wrap">
      <input
        type="color"
        class="palette-color"
        v-for="(color, index) in palette"
        :value="color"
        :key="index"
        @change="(event) => (palette[index] = event.target.value)"
        @contextmenu="contextClick($event, index)"
        :title="index"
      />
      <Button @click="addWebColor">Add color</Button>
      <ContextMenu
        ref="paletteMenu"
        :model="paletteOptions"
        @hide="selectedSceneTab = null"
      />
    </div>

    <div class="form-row">
      <label class="label">Background color</label>
      <color-picker v-model="bgColor" />
    </div>

    <div class="form-row">
      <label class="label">Page color</label>
      <color-picker v-model="pageColor" />
    </div>
    <div class="form-row">
      <label class="label">Progress animation color</label>
      <color-picker v-model="progressColor" />
    </div>
    <div class="form-row">
      <label class="label">Text color</label>
      <color-picker v-model="textColor" />
    </div>
  </Fieldset>

  <Fieldset legend="Gcode colors">
    <div class="form-row">
      <label class="label">Rapid moves</label>
      <input type="color" v-model="gcodeColors.G0" />
    </div>
    <div class="form-row">
      <label class="label">Feed moves</label>
      <input type="color" v-model="gcodeColors.G1" />
    </div>
    <div class="form-row">
      <label class="label">Curve moves</label>
      <input type="color" v-model="gcodeColors.G2G3" />
    </div>
  </Fieldset>

  <Fieldset legend="Text">
    <div class="form-row">
      <label class="label">Font</label>
      <font-select v-model="font" />
    </div>

    <div class="form-row">
      <label class="label">Font size</label>
      <InputNumber
        v-model="fontSize"
        :minFractionDigits="0"
        :maxFractionDigits="2"
      />
    </div>

    <div class="form-row">
      <label class="label">Line height</label>
      <InputNumber
        v-model="lineHeight"
        :minFractionDigits="0"
        :maxFractionDigits="2"
      />
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
