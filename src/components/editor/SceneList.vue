<script>
import { computed, ref, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

import TabPanels from 'primevue/tabpanels'
import InputText from 'primevue/inputtext'
import TabPanel from 'primevue/tabpanel'
import TabList from 'primevue/tablist'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tabs from 'primevue/tabs'
import Tab from 'primevue/tab'
</script>

<script setup>
import { useScenesStore } from '@/stores/scenes'
import { useEditorStore } from '@/stores/editor'

const sceneStore = useScenesStore()
const editorStore = useEditorStore()
const ui = useUiStore()

const { scenes } = storeToRefs(sceneStore)
const { sceneName } = storeToRefs(ui)

watch(
  sceneName,
  (name) => {
    editorStore.setActiveRow(0)
    editorStore.setActiveColumn(0)
    editorStore.setActiveButton(scenes.value[name]?.buttons?.[0]?.[0])
  },
  { immediate: true }
)

const setScene = (name) => {
  ui.goToScene(name)
}
const tabModel = computed({
  get() {
    return sceneName.value
  },
  set(name) {
    ui.goToScene(name)
  },
})
const valid = computed(() => {
  return (
    newSceneName.value === '' || sceneStore.scene(newSceneName.value) == null
  )
})
const addScene = () => {
  if (newSceneName.value.trim() !== '') {
    if (!valid.value) {
      return
    }
    sceneStore.addScene(newSceneName.value)
    ui.goToScene(newSceneName.value)
  }
  dialogOpen.value = false
}
const newSceneName = ref('')

const dialogOpen = ref(false)
</script>

<template>
  <div class="scene-list">
    <div class="flex-row flex-center">
      <Tabs v-model:value="tabModel" scrollable fluid>
        <TabList>
          <Tab v-for="(buttons, tab) in scenes" :key="tab" :value="tab">
            {{ tab }}
          </Tab>
        </TabList>
      </Tabs>
      <Button label="Add" @click="dialogOpen = true"></Button>
    </div>
  </div>

  <Dialog v-model:visible="dialogOpen" modal header="New scene name">
    <InputText
      v-model="newSceneName"
      fluid
      autofocus
      :invalid="!valid"
    ></InputText>

    <div class="button-row">
      <Button type="button" label="Save" @click="addScene"></Button>

      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="dialogOpen = false"
      ></Button>
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.p-tab {
  font-size: 1rem;
  font-weight: normal;
}

.nav-tabs {
  display: flex;
  flex-wrap: wrap;
}

.nav-item {
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
}

.nav-item.active {
  color: #000;
  background-color: #51d4ff;
}

.tab-wrapper {
  display: flex;
}

.p-tabs {
  min-width: 0;
}
.p-button {
  height: 2rem;
}
.button-row {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
}
</style>
