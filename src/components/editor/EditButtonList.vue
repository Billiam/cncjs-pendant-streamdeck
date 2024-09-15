<script>
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useEditorStore } from '@/stores/editor'
import { computed, nextTick, ref } from 'vue'
import { arrayWrap } from '@/lib/enumerable'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import omit from 'lodash/omit'

import Button from 'primevue/button'

import ButtonList from './ButtonList.vue'
import Cell from '@/components/Cell.vue'
</script>

<script setup>
const sceneStore = useScenesStore()
const ui = useUiStore()
const editor = useEditorStore()
const buttonStore = useButtonStore()

const { scenes } = storeToRefs(sceneStore)
const { sceneName } = storeToRefs(ui)
const { activeButton, activeColumn, activeRow } = storeToRefs(editor)

const scene = computed(() => {
  if (!sceneName.value) {
    return
  }
  return sceneStore.scene(sceneName.value)
})

const buttonNames = computed(() => {
  if (activeColumn.value == null || activeRow.value == null || !scene.value) {
    return []
  }
  return arrayWrap(scene.value.buttons[activeRow.value]?.[activeColumn.value])
})

const buttonList = computed(() => {
  return buttonNames.value.map((buttonName) => {
    const button = buttonStore.button(buttonName)
    if (button) {
      return omit(button, ['actions', 'if', 'disabled'])
    }
  })
})

const removeButton = (buttonName) => {
  sceneStore.removeButton(
    sceneName.value,
    buttonName,
    activeRow.value,
    activeColumn.value
  )
  if (buttonName === activeButton.value) {
    nextTick(() => {
      editor.setActiveButton(buttonNames.value[0])
    })
  }
}
const newButtonName = ref('')
const addButton = () => {
  const buttonName = newButtonName.value

  if (buttonName) {
    if (!buttonStore.button(buttonName)) {
      buttonStore.addButton(buttonName, { bgColor: 0 })
    }

    sceneStore.addButton(
      sceneName.value,
      buttonName,
      activeRow.value,
      activeColumn.value
    )
    newButtonName.value = ''
    editor.setActiveButton(buttonName)
  }
}
</script>

<template>
  <div class="button-list">
    <h2>
      Scene: {{ sceneName }} - row {{ activeRow }}, column {{ activeColumn }}
    </h2>
    <div class="buttons">
      <template v-for="(button, index) in buttonList" :key="buttonNames[index]">
        <div class="cell-wrapper">
          <button
            class="remove-button"
            title="remove"
            @click="removeButton(buttonNames[index])"
          ></button>
          <Cell
            :class="{ active: buttonNames[index] === activeButton }"
            :config="button"
            @click="editor.setActiveButton(buttonNames[index])"
            v-if="button"
            :name="buttonNames[index]"
          ></Cell>
        </div>
      </template>
    </div>

    <div>
      <button-list v-model="newButtonName"></button-list>
      <Button fluid primary label="Add button" @click="addButton"></Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.button-list {
  padding: 20px;
  border-radius: 8px;
  margin: 10px 0;
  box-shadow: 0 3px 20px 0 rgba(0, 0, 0, 0.5) inset;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.cell-wrapper {
  position: relative;
}

.cell {
  aspect-ratio: 1;
  height: 144px;
  width: 144px;
  transform: scale(0.8);
  outline-offset: 4px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
  &.active {
    outline: 2px solid var(--color-highlight);
  }
}
.button-list button.remove-button {
  top: 16px;
  right: 16px;
}
</style>
