<script>
import schema from 'cncjs-pendant-streamdeck-validator/dist/config.schema.json'
import { computed, ref, toRefs, watch } from 'vue'

import { groupedActionObjects } from '@/lib/grouped-actions'

import Fieldset from 'primevue/fieldset'
import Select from 'primevue/select'

const actions = import.meta.glob('./actions/*.vue', { eager: true })

const eventTypes = schema.definitions.action.properties.event.enum

const components = Object.entries(schema.actionSchemas).reduce(
  (result, [key, property]) => {
    if (key === 'noArguments') {
      return result
    }
    const componentName = key.charAt(0).toUpperCase() + key.slice(1)
    const component = actions[`./actions/${componentName}.vue`]
    if (!component) {
      console.error(`Component ${componentName} has not been defined`)
      return result
    }
    if (property.properties.action?.enum) {
      property.properties.action.enum.forEach((buttonName) => {
        result[buttonName] = component.default
      })
    } else if (property.properties.action?.const) {
      result[property.properties.action.const] = component.default
    }

    return result
  },
  {},
)
</script>

<script setup>
import { groupedActionObjects } from '@/lib/grouped-actions'
import { useButtonStore } from '@/stores/buttons'
import { arrayWrap } from '@/lib/enumerable'

const props = defineProps({
  action: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  button: {
    type: String,
    required: true,
  },
})
const buttons = useButtonStore()
const { index, action } = toRefs(props)

const fieldModel = (field, defaultValue = null) => {
  return computed({
    get() {
      return props.action[field] ?? defaultValue
    },
    set(value) {
      if (value === defaultValue) {
        value = undefined
      }
      buttons.updateButtonAction(props.button, props.index, field, value)
    },
  })
}
const actionModel = fieldModel('action')
const eventModel = fieldModel('event', 'down')
const optionsModel = fieldModel('arguments')

const deleteAction = () => {
  buttons.deleteButtonAction(props.button, props.index)
}

const optionsComponent = computed(() => {
  return components[props.action.action]
})
watch(optionsComponent, () => {
  // clear on change
  optionsModel.value = undefined
})

const documentationLink = computed(() => {
  if (!props.action.action) {
    return
  }
  const anchor = props.action.action.toLowerCase()
  return `https://billiam.github.io/cncjs-pendant-streamdeck/docs/actions/#${anchor}`
})
</script>

<template>
  <fieldset class="action">
    <button class="remove-button" title="remove" @click="deleteAction"></button>

    <label class="label">Action name</label>
    <Select
      v-model="actionModel"
      :options="groupedActionObjects"
      optionGroupLabel="label"
      optionGroupChildren="children"
      autoFilterFocus
      filter
      fluid
    >
    </Select>

    <a
      :href="documentationLink"
      v-if="documentationLink"
      target="_blank"
      class="action-link"
      >{{ action.action }} documentation</a
    >

    <label class="label">Mouse trigger</label>
    <Select v-model="eventModel" :options="eventTypes" fluid></Select>

    <Fieldset class="options" legend="Options">
      <component
        v-if="optionsComponent"
        :is="optionsComponent"
        v-model="optionsModel"
      ></component>
      <div v-else><em>None</em></div>
    </Fieldset>
  </fieldset>
</template>

<style scoped>
.action {
  position: relative;
  border: 1px solid #222;
  border-radius: 3px;
  background-color: #131313;
  padding: 10px;
  margin-bottom: 8px;
}
.action:deep(.select),
.action:deep(.text-input) {
  background-color: #0e0e0e;
}
.options,
:deep(.p-fieldset-legend) {
  background: #131313;
}
.action-link {
  display: block;
  margin-bottom: 0.8rem;
}
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-inputgroupaddon) {
  background-color: #101010;
}
:deep(.p-inputtext:disabled),
:deep(.p-togglebutton:disabled) {
  background-color: transparent;
  opacity: 0.3;
}
:deep(.p-togglebutton:disabled) {
  border-color: transparent;
}
</style>
