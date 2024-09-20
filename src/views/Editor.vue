<script>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useDynamicScene } from '@/lib/dynamic-scene'
import { useUiStore } from '@/stores/ui'

import ToggleSwitch from 'primevue/toggleswitch'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import TabList from 'primevue/tablist'
import Tabs from 'primevue/tabs'
import Tab from 'primevue/tab'

import ConnectionSettings from '@/components/editor/ConnectionSettings.vue'
import EditButtonList from '@/components/editor/EditButtonList.vue'
import ButtonEditor from '@/components/editor/ButtonEditor.vue'
import SceneList from '@/components/editor/SceneList.vue'
</script>

<script setup>
import { useEditorStore } from '@/stores/editor'

const { scene, sceneType } = useDynamicScene()
const editor = useEditorStore()
const ui = useUiStore()

const { rows, columns, web } = storeToRefs(ui)
const resolution = 144
const gap = 10
const width = computed(
  () => columns.value * resolution + (columns.value + 1) * gap
)
const height = computed(() => rows.value * resolution + (rows.value + 1) * 10)

const gridColumns = computed(() => `repeat(${columns.value}, 144px)`)
const gridRows = computed(() => `repeat(${rows.value}, 144px)`)
const gridWidth = computed(
  () => columns.value * 144 + (columns.value - 1) * 10 + 12
)
const gridHeight = computed(() => rows.value * 144 + (rows.value - 1) * 10 + 12)

const isStreamdeck = computed({
  get() {
    return !web.value
  },
  set(value) {
    web.value = !value
  },
})
</script>

<template>
  <div class="page">
    <Tabs value="layout" fluid>
      <TabList>
        <Tab value="layout">Layout</Tab>
        <Tab value="ui">UI</Tab>
        <Tab value="cnc">CNC</Tab>
        <Tab value="connection">Connection</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="layout">
          <div class="layout-editor">
            <div class="column main">
              <h2>Scenes</h2>
              <scene-list></scene-list>
              <div class="preview">
                <component
                  v-if="scene"
                  :is="sceneType"
                  :editor="true"
                  :buttons="scene.buttons"
                ></component>
              </div>

              <div class="scene-settings flex-row flex-center">
                <ToggleSwitch
                  inputId="use_streamdeck_display"
                  v-model="isStreamdeck"
                ></ToggleSwitch>
                <label for="use_streamdeck_display"
                  >Use streamdeck display</label
                >
              </div>
            </div>
            <div class="column editor">
              <edit-button-list></edit-button-list>
              <button-editor></button-editor>
            </div>
          </div>
        </TabPanel>
        <TabPanel value="ui">
          <div class="column">
            <h2>UI settings</h2>
          </div>
        </TabPanel>
        <TabPanel value="cnc"><h2>CNC Settings</h2></TabPanel>
        <TabPanel value="connection">
          <div class="column">
            <h2>Connection Settings</h2>
            <connection-settings></connection-settings>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style>
:root {
  --color-highlight: #15cbcb;
}
</style>

<style lang="scss" scoped>
.page {
  padding-top: 30px;

  //display: flex;
  //flex-wrap: wrap;
}
.scene-settings {
  margin-top: 2rem;
}
.layout-editor {
  display: flex;
  flex-wrap: wrap;
  min-width: 850px;
}
.main {
  position: sticky;
  top: 30px;
}
.column {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 20em;
  padding: 0 20px;
  height: 100%;
  max-width: 850px;
}
.editor {
  max-width: none;
}

.preview {
  padding: 8px;
  background-color: #111;
  display: inline-block;

  :deep(.scene) {
    font-size: 1.2rem;
    grid-gap: 10px;
    grid-template-columns: v-bind(gridColumns);
    grid-template-rows: v-bind(gridRows);
    padding: 6px;
    overflow: hidden;
    width: v-bind('gridWidth + "px"');
    height: v-bind('gridHeight + "px"');
  }
}
:deep() {
  .label {
    font-weight: bold;
    display: block;
    font-size: 1.1em;
    margin-bottom: 5px;
  }
  .form {
    padding: 2em 1em 1em 1em;
    border: 1px solid #111;
    background-color: #151515;
  }
  .form-row {
    border-bottom: 1px solid #333;
    padding: 10px 0;
  }
  .flex-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .flex-center {
    align-items: center;
  }
  .text-input {
    background-color: #131313;
    border: 1px solid #222;
    color: #efefef;
    line-height: 2rem;
    padding: 0 8px;
    border-radius: 3px;
    width: 100%;
  }
  input[type='number'] {
    padding-left: 8px;
    padding-right: 0;
  }
  .inline {
    display: inline;
    width: 5em;
    padding: 0;
    margin: 0 8px;
  }
  .select {
    display: block;
    background-color: #131313;
    color: #efefef;
    border: 1px solid #222;
    padding: 8px;
    width: 100%;
  }
  .icon-input {
    display: block;
    width: 100%;
    margin-bottom: 10px;
  }
  .help {
    margin-left: 8px;
    img {
      width: 25px;
      height: 25px;
      vertical-align: bottom;
    }
  }
  .active-icon,
  .change-icon {
    width: 144px;
    height: 144px;
    border: 0;
    padding: 0;
    vertical-align: middle;
    margin-right: 10px;

    cursor: pointer;
  }
  .change-icon {
    background-color: #111;
    color: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  input:invalid {
    border-color: #cb334c;
  }

  .remove-button {
    cursor: pointer;
    width: 26px;
    height: 26px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    background: url('/icons/system-uicons/trash.png') no-repeat center,
      rgba(0, 0, 0, 0.7);
    background-size: 18px 18px;
    position: absolute;
    image-rendering: -webkit-optimize-contrast;
    border-radius: 5px;
    top: 6px;
    right: 6px;
    z-index: 200;
  }

  .wide-button {
    display: block;
    width: 100%;
    background-color: #222;
    border: 1px solid #333;
    border-radius: 3px;
    color: #eee;
    padding: 6px;
    cursor: pointer;
    margin-bottom: 8px;
  }
}
::v-global(button) {
  font-family: inherit;
}
</style>
