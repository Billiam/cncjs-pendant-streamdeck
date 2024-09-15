<script>
import { computed, ref, watch } from 'vue'

import { useArrayVmodel } from '@/lib/array-v-model'
import { useScenesStore } from '@/stores/scenes'

import SelectButton from 'primevue/selectbutton'
import RadioButton from 'primevue/radiobutton'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
</script>

<script setup>
const sceneStore = useScenesStore()

const emits = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})
const { itemModel } = useArrayVmodel(props, emits)

const option0 = itemModel(0)
const option1 = itemModel(1)

const typeSelect = ref('text')
const booleans = [true, false]

watch(typeSelect, (value) => {
  option1.value = null
})

const textValue = computed({
  get() {
    if (typeSelect.value !== 'text') {
      return null
    }
    return option1.value
  },
  set(value) {
    option1.value = value
  },
})
const numberValue = computed({
  get() {
    if (typeSelect.value !== 'number') {
      return null
    }
    return option1.value
  },
  set(value) {
    option1.value = value
  },
})
const booleanValue = computed({
  get() {
    if (typeSelect.value !== 'boolean') {
      return null
    }
    return option1.value
  },
  set(value) {
    option1.value = !!value
  },
})
</script>

<template>
  <label class="label">User flag name</label>
  <InputText v-model="option0" required fluid></InputText>

  <div class="value-options">
    <div class="flex-row flex-center">
      <RadioButton
        v-model="typeSelect"
        inputId="type_text"
        name="type"
        value="text"
      />
      <label for="type_text">Text</label>

      <InputText
        v-model="textValue"
        :disabled="typeSelect !== 'text'"
        fluid
      ></InputText>
    </div>

    <div class="flex-row flex-center">
      <RadioButton
        v-model="typeSelect"
        inputId="type_number"
        name="type"
        value="number"
      />
      <label for="type_number">Number</label>

      <InputNumber
        v-model="numberValue"
        :disabled="typeSelect !== 'number'"
        :minFractionDigits="0"
        :maxFractionDigits="10"
        fluid
      ></InputNumber>
    </div>

    <div class="flex-row flex-center">
      <RadioButton
        v-model="typeSelect"
        inputId="type_boolean"
        name="type"
        value="boolean"
      />
      <label for="type_boolean">Boolean</label>

      <SelectButton
        v-model="booleanValue"
        :options="booleans"
        :disabled="typeSelect !== 'boolean'"
      />
    </div>
  </div>
</template>

<style scoped>
.value-options {
  margin-top: 1rem;
}
</style>
