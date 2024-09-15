<script>
import { useUiStore } from '@/stores/ui'
import { computed, ref } from 'vue'
import Color from '@/lib/color'
</script>

<script setup>
import { getCurrentInstance } from 'vue'

const ui = useUiStore()
const { findColor, normalizeColor, contrastColor } = Color()
const props = defineProps({
  modelValue: {
    required: true,
  },
})
const emits = defineEmits(['update:modelValue'])
const emit = (value) => emits('update:modelValue', value)

const colorValue = computed({
  get() {
    return normalizeColor(props.modelValue)
  },
  set(value) {
    emit(findColor(value))
  },
})

const instance = getCurrentInstance()
const uuid = ref(instance.uid)
</script>

<template>
  <div class="color-picker">
    <div class="swatches">
      <button
        class="btn"
        v-for="(color, index) in ui.palette"
        :class="{ active: modelValue == index }"
        :style="{
          backgroundColor: color,
          borderColor: contrastColor(color),
        }"
        @click="emit(index)"
      ></button>
    </div>

    <div class="flex-row flex-center">
      <label :for="uuid" class="label">Custom</label>
      <input :id="uuid" type="color" v-model="colorValue" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-picker {
  padding: 8px;
  margin-bottom: 10px;
}
.swatches {
  margin-bottom: 10px;
}
.btn {
  cursor: pointer;
  border-width: 1px;
  border-style: solid;
  appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 5px;
  margin-right: 8px;
  margin-bottom: 8px;

  transition: transform 0.15s;
  &.active {
    outline: 2px solid var(--color-highlight);
    outline-offset: 4px;
  }
  &:hover {
    transform: translateY(-3px);
  }
}
</style>
