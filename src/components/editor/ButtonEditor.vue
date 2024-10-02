<script>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import schema from 'cncjs-pendant-streamdeck-validator/dist/config.schema.json'
import { useButtonStore } from '@/stores/buttons'
import { useEditorStore } from '@/stores/editor'
import { useUiStore } from '@/stores/ui'
import Color from '@/lib/color'

import InputGroupAddon from 'primevue/inputgroupaddon'
import InputNumber from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import vTooltip from 'primevue/tooltip'
import Select from 'primevue/select'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'

import IconSelector from '@/components/editor/IconSelector.vue'
import ColorPicker from '@/components/editor/ColorPicker.vue'
import Action from '@/components/editor/Action.vue'

const actions = schema.definitions.action.properties.action.enum
const buttonTypes =
  schema.properties.buttons.patternProperties['^.+$'].properties.type.enum

const sortedAlignments = [
  'top left',
  'top center',
  'top right',

  'left',
  'center',
  'right',

  'bottom left',
  'bottom center',
  'bottom right',
]
</script>

<script setup>
const color = Color()

const editor = useEditorStore()
const buttonStore = useButtonStore()
const ui = useUiStore()

const { activeButton } = storeToRefs(editor)
const { buttons } = storeToRefs(buttonStore)

const button = computed(() => buttons.value[activeButton.value])

const { rows: uiRows, columns: uiColumns } = storeToRefs(ui)

const buttonWriter = (
  field,
  defaultValue = '',
  filterShow = null,
  filterSave = null
) => {
  return computed({
    get() {
      const value = button.value?.[field] ?? defaultValue
      if (filterShow) {
        return filterShow(value)
      }
      return value
    },
    set(value) {
      if (filterSave) {
        const previousValue = button.value?.[field] ?? defaultValue

        value = filterSave(value, previousValue)

        if (previousValue === value) {
          return
        }
      }

      if (value == null || value === defaultValue) {
        buttonStore.removeButtonField(activeButton.value, field)
      } else {
        buttonStore.updateButton(activeButton.value, field, value)
      }
    },
  })
}

const cellBgColor = buttonWriter('bgColor')
const columns = buttonWriter('columns', 1)
const description = buttonWriter('description')
const disabledAttr = buttonWriter('disabled')
const icon = buttonWriter('icon')
const ifAttr = buttonWriter('if')
const rows = buttonWriter('rows', 1)
const text = buttonWriter('text')
const textAlignment = buttonWriter('textAlignment', 'center')
const textSize = buttonWriter(
  'textSize',
  1,
  (value) => value * 100,
  (value) => value * 0.01
)
const typeAttr = buttonWriter('type')
const gcodeType = computed({
  get() {
    return typeAttr.value === buttonTypes[0]
  },
  set(val) {
    typeAttr.value = val ? buttonTypes[0] : null
  },
})

const addAction = () => {
  buttonStore.addButtonAction(activeButton.value, {})
}
const iconDrawerVisible = ref(false)
const setDimensions = (r, c) => {
  rows.value = r
  columns.value = c
}
</script>

<template>
  <div class="form" v-if="button">
    <h2>Button: {{ activeButton }}</h2>

    <div class="form-row">
      <label class="label">Icon</label>
      <input v-model="icon" class="icon-input text-input" />
      <div v-if="button.icon">
        <button class="change-icon" @click="iconDrawerVisible = true">
          <img
            :src="`icons/${button.icon}`"
            class="active-icon"
            v-if="button.icon"
          />
        </button>
        <Button @click="icon = null" severity="secondary">Remove icon</Button>
      </div>

      <button class="change-icon" @click="iconDrawerVisible = true" v-else>
        none
      </button>
    </div>

    <div class="form-row">
      <label class="label">Background color</label>
      <color-picker v-model="cellBgColor"></color-picker>

      <div class="flex-row flex-center">
        <Checkbox
          inputId="gcode_preview"
          v-model="gcodeType"
          value="gcodePreview"
          :binary="true"
        />

        <label class="label" for="gcode_preview"> Render gcode</label>
      </div>
    </div>

    <div class="form-row">
      <label class="label"
        >Description
        <span class="help">
          <img
            class="help"
            src="/icons/fluent-ui/question_circle.png"
            alt="help"
            v-tooltip="'Adds aria label and popup text on hover to the button'"
          />
        </span>
      </label>
      <InputText v-model="description"></InputText>
    </div>
    <div class="form-row">
      <label class="label">Dimensions</label>
      <div class="flex-row">
        <InputGroup>
          <InputNumber
            :min="1"
            :max="uiRows"
            v-model="rows"
          />
          <InputGroupAddon>rows</InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputNumber
            :min="1"
            :max="uiColumns"
            v-model="columns"
          />
          <InputGroupAddon>columns</InputGroupAddon>
        </InputGroup>
      </div>

      <div class="flex-row">
        <div class="dimension-buttons grid-buttons">
          <template v-for="r in uiRows">
            <button
              @click="setDimensions(r, c)"
              :class="{ active: rows >= r && columns >= c }"
              v-for="c in uiColumns"
            ></button>
          </template>
        </div>
      </div>
    </div>

    <div class="form-row">
      <label class="label"
        >Text
        <a
          href="https://billiam.github.io/cncjs-pendant-streamdeck/docs/variables/#templates"
          target="blank"
          class="help"
          v-tooltip="'Templating documentation'"
          ><img src="/icons/fluent-ui/question_circle.png" alt="help" /></a
      ></label>
      <Textarea v-model="text" rows="5" fluid></Textarea>

      <label class="label">Text alignment</label>
      <div class="flex-row flex-center">
        <div class="grid-buttons">
          <button
            :class="{ active: alignment === textAlignment }"
            @click="textAlignment = alignment"
            v-for="alignment in sortedAlignments"
            v-tooltip.top="alignment"
          ></button>
        </div>
        {{ textAlignment }}
      </div>

      <label class="label">Text size</label>
      <InputGroup>
        <InputNumber :min="1" v-model="textSize" />
        <InputGroupAddon>%</InputGroupAddon>
      </InputGroup>
    </div>

    <div class="form-row">
      <label class="label"
        >If
        <a
          href="https://billiam.github.io/cncjs-pendant-streamdeck/docs/variables/#conditions"
          target="blank"
          class="help"
          v-tooltip="'Button condition documentation'"
          ><img src="/icons/fluent-ui/question_circle.png" alt="help" /></a
      ></label>
      <InputText v-model="ifAttr" fluid></InputText>
    </div>

    <div class="form-row">
      <label class="label"
        >Disabled
        <a
          href="https://billiam.github.io/cncjs-pendant-streamdeck/docs/variables/#conditions"
          target="blank"
          class="help"
          v-tooltip="'Button condition documentation'"
          ><img src="/icons/fluent-ui/question_circle.png" alt="help" /></a
      ></label>
      <InputText v-model="disabledAttr" fluid></InputText>
    </div>

    <div class="form-row">
      <label class="label"
        >Actions
        <a
          href="https://billiam.github.io/cncjs-pendant-streamdeck/docs/configure/#buttonactions"
          target="blank"
          class="help"
          v-tooltip="'Button action documentation'"
          ><img src="/icons/fluent-ui/question_circle.png" alt="help" /></a
      ></label>

      <action
        v-for="(action, index) in button.actions"
        :action="action"
        :index="index"
        :key="`${activeButton}-${action.action}-${index}`"
        :button="activeButton"
      ></action>
      <Button fluid label="Add new action" @click="addAction"></Button>
    </div>
  </div>

  <div class="card flex justify-center">
    <Drawer v-model:visible="iconDrawerVisible" header="Icons" position="right">
      <icon-selector v-model="icon"></icon-selector>
    </Drawer>
  </div>
</template>

<style lang="scss" scoped>
.grid-buttons {
  border: 1px #222;
  display: grid;
  grid-template-columns: repeat(3, 40px);
  grid-template-rows: repeat(3, 40px);

  border: 1px solid #333;
  border-left: 0;
  border-bottom: 0;

  button {
    background: transparent;

    appearance: none;
    border: 1px solid #333;
    border-top: 0;
    border-right: 0;
    cursor: pointer;

    &.active {
      background-color: var(--color-highlight);
      &:hover {
        background-color: #5580ad;
      }
    }
    &:hover {
      background-color: #2c3e50;
    }
  }
}
.dimension-buttons {
  display: grid;
  grid-template-columns: v-bind('"repeat(" + uiColumns + ", 40px)"');
  grid-template-rows: v-bind('"repeat(" + uiRows + ", 40px)"');
}
</style>
