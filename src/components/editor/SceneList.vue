<script>
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

import { useUiStore } from '@/stores/ui'

import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import ContextMenu from 'primevue/contextmenu'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import { useConfirm } from 'primevue/useconfirm'
</script>

<script setup>
import { useScenesStore } from '@/stores/scenes'
import { useEditorStore } from '@/stores/editor'

const sceneStore = useScenesStore()
const editorStore = useEditorStore()
const ui = useUiStore()

const { scenes } = storeToRefs(sceneStore)
const { sceneName } = storeToRefs(ui)

const sortedScenes = computed(() => {
  return [
    'home',
    ...Object.keys(scenes.value)
      .filter((key) => key !== 'home')
      .sort((a, b) => a.localeCompare(b)),
  ]
})

const confirm = useConfirm()

const confirmDelete = (scene) => {
  confirm.require({
    group: 'delete',
    message: 'Are you sure you want to delete this scene?',
    header: 'Confirmation',
    accept: () => {
      sceneStore.removeScene(scene)
    },
    rejectProps: {
      severity: 'secondary',
      outlined: true,
    },
  })
}

watch(
  sceneName,
  (name) => {
    editorStore.setActiveRow(0)
    editorStore.setActiveColumn(0)

    const scene = sceneStore.scene(name)
    const button = scene?.buttons?.[0]?.[0]
    editorStore.setActiveButton(button)
  },
  { immediate: true },
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
  addSceneDialogOpen.value = false
}
const newSceneName = ref('')
const renameSceneName = ref('')

const menu = ref()
const selectedSceneTab = ref()

const addSceneDialogOpen = ref(false)
const renameSceneDialogOpen = ref(false)

const sceneToRename = ref('')

watch(sceneToRename, (value) => {
  renameSceneName.value = value
})

const contextClick = (event, scene) => {
  selectedSceneTab.value = scene
  menu.value.show(event)
}
const deleteScene = () => {
  confirmDelete(selectedSceneTab.value)
}
const renameScene = () => {
  sceneToRename.value = selectedSceneTab.value
  renameSceneDialogOpen.value = true
}
const saveRenameScene = () => {
  if (renameSceneName.value === '' || sceneStore.scene(renameSceneName.value)) {
    return
  }
  sceneStore.renameScene(sceneToRename.value, renameSceneName.value)
  renameSceneDialogOpen.value = false
}

const nonEditableScenes = ['home', 'fileList']
const contextOptions = [
  {
    label: 'Delete',
    command: deleteScene,
    disabled: () => nonEditableScenes.includes(selectedSceneTab.value),
  },
  {
    label: 'Rename',
    command: renameScene,
    disabled: () => nonEditableScenes.includes(selectedSceneTab.value),
  },
]
</script>

<template>
  <ConfirmDialog group="delete"></ConfirmDialog>

  <div class="scene-list">
    <div class="flex-row flex-center">
      <Tabs v-model:value="tabModel" scrollable fluid>
        <TabList>
          <Tab
            v-for="tab in sortedScenes"
            :key="tab"
            :value="tab"
            @contextmenu="contextClick($event, tab)"
            aria-haspopup="true"
          >
            {{ tab }}
          </Tab>
        </TabList>
        <ContextMenu
          ref="menu"
          :model="contextOptions"
          @hide="selectedSceneTab = null"
        />
      </Tabs>
      <Button
        class="add-scene"
        label="Add scene"
        @click="addSceneDialogOpen = true"
      ></Button>
    </div>
  </div>

  <Dialog v-model:visible="addSceneDialogOpen" modal header="New scene name">
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
        @click="addSceneDialogOpen = false"
      ></Button>
    </div>
  </Dialog>

  <Dialog v-model:visible="renameSceneDialogOpen" modal header="Rename scene">
    <p>Rename {{ sceneToRename }} scene to {{ renameSceneName }}</p>
    <InputText
      fluid
      autofocus
      :invalid="!valid"
      v-model="renameSceneName"
    ></InputText>

    <div class="button-row">
      <Button type="button" label="Save" @click="saveRenameScene"></Button>

      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="renameSceneDialogOpen = false"
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
.add-scene:deep(.p-button-label) {
  padding: 0 10px;
  white-space: nowrap;
}
</style>
