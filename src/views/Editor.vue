<script>
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

import { useDynamicScene } from '@/lib/dynamic-scene'
import { useMediaQuery } from '@/lib/media-query'
import { usePrimevue } from '@/lib/primevue'
import { saveConfig } from '@/lib/save-config'
import { useCncStore } from '@/stores/cnc'
import { useEditorStore } from '@/stores/editor'
import { useUiStore } from '@/stores/ui'

import Dialog from 'primevue/dialog'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'
import ToggleSwitch from 'primevue/toggleswitch'
import vTooltip from 'primevue/tooltip'

import ButtonEditor from '@/components/editor/ButtonEditor.vue'
import CncSettings from '@/components/editor/CncSettings.vue'
import ConnectionSettings from '@/components/editor/ConnectionSettings.vue'
import EditButtonList from '@/components/editor/EditButtonList.vue'
import SceneList from '@/components/editor/SceneList.vue'
import StreamdeckSettings from '@/components/editor/StreamdeckSettings.vue'
import UiSettings from '@/components/editor/UiSettings.vue'
</script>

<script setup>
import { useScenesStore } from '@/stores/scenes'

usePrimevue()

const { scene, sceneType } = useDynamicScene()
const editor = useEditorStore()
const ui = useUiStore()
const cnc = useCncStore()
const sceneStore = useScenesStore()

const { rows, columns, web } = storeToRefs(ui)
const { connected, socketConnected } = storeToRefs(cnc)

const resolution = 144

sceneStore.loadEditorScenes()

const showSettings = ref(false)
const defaultTab = ref('connection')
const settingsTab = ref(defaultTab)
watch([connected, socketConnected], ([conn, socket]) => {
  if (!showSettings.value) {
    defaultTab.value = conn && socket ? 'ui' : 'connection'
  }
})

const gap = computed(() => 10 * (isStreamdeck.value ? 2 : 1))
const width = computed(
  () => columns.value * resolution + (columns.value + 1) * gap.value,
)
const height = computed(
  () => rows.value * resolution + (rows.value + 1) * gap.value,
)

const gridColumns = computed(() => `repeat(${columns.value}, 144px)`)
const gridRows = computed(() => `repeat(${rows.value}, 144px)`)
const gridWidth = computed(
  () => columns.value * 144 + (columns.value - 1) * gap.value + 12 + 24,
)
const gridHeight = computed(
  () => rows.value * 144 + (rows.value - 1) * gap.value + 12 + 24,
)
const minWidth = computed(
  () => `(min-width: calc(${gridWidth.value}px + 20rem))`,
)
const maxWidth = computed(() => `calc(${gridWidth.value}px + 40rem)`)

const { match } = useMediaQuery(minWidth)
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
    <div class="actions">
      <button
        class="action-button"
        v-tooltip.left="'Save configuration'"
        @click="saveConfig"
      >
        <img class="icon" src="/icons/fluent-ui/save.png" />
      </button>
      <button
        class="action-button"
        @click="showSettings = true"
        v-tooltip="'Settings'"
      >
        <img class="icon" src="/icons/fluent-ui/settings.png" />
      </button>
    </div>
    <Dialog
      v-model:visible="showSettings"
      modal
      header="Settings"
      position="top"
      style="width: 40rem"
      :dismissableMask="true"
    >
      <Tabs v-model:value="settingsTab" fluid>
        <TabList>
          <Tab value="ui">UI</Tab>
          <Tab value="streamdeck">Stream Deck</Tab>
          <Tab value="cnc">CNC</Tab>
          <Tab value="connection">Connection</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="ui">
            <div class="column">
              <h2>UI settings</h2>
              <ui-settings></ui-settings>
            </div>
          </TabPanel>
          <TabPanel value="streamdeck">
            <div class="column">
              <h2>Streamdeck settings</h2>
              <p>
                These settings are optional and override the existing
                <span>UI settings</span>
              </p>
              <streamdeck-settings></streamdeck-settings>
            </div>
          </TabPanel>
          <TabPanel value="cnc">
            <div class="column">
              <h2>CNC Settings</h2>
              <cnc-settings></cnc-settings>
            </div>
          </TabPanel>
          <TabPanel value="connection">
            <div class="column">
              <h2>Connection Settings</h2>
              <connection-settings></connection-settings>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dialog>

    <div class="layout-editor" :class="{ wide: match }">
      <div class="column main">
        <scene-list></scene-list>
        <div class="preview" :class="{ streamdeck: isStreamdeck }">
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
          <label for="use_streamdeck_display">Use stream deck display</label>
        </div>
      </div>
      <div class="column editor">
        <edit-button-list></edit-button-list>
        <button-editor></button-editor>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --color-highlight: #15cbcb;
}
body {
  background: #111;
}
</style>

<style lang="scss" scoped>
.actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
.action-button {
  background: none;
  border: 0;
  cursor: pointer;

  .icon {
    max-width: 30px;
    max-height: 30px;
  }
}
.page {
  padding-top: 30px;
  max-width: v-bind(maxWidth);
  margin: 0 auto;
}
.scene-settings {
  margin-top: 2rem;
}
.layout-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 1rem;
}
.wide {
  &.layout-editor {
    flex-wrap: nowrap;
    padding-top: 0;
  }
  .main {
    position: sticky;
    top: 30px;
  }
  .editor {
    flex-basis: 20rem;
  }
}
.main {
  padding-left: 20px;
  width: v-bind('gridWidth + 20 + "px"');
}
.column {
  flex-shrink: 1;
  height: 100%;
}
.editor {
  padding-top: 2.5rem;
  flex-grow: 1;
  flex-basis: 100%;
}

.preview {
  padding: 8px;
  display: inline-block;
  background: var(--color-background);
  :deep(.scene) {
    font-size: 1.2rem;
    grid-gap: 10px;
    grid-template-columns: v-bind(gridColumns);
    grid-template-rows: v-bind(gridRows);
    padding: 6px;
    overflow: hidden;
    width: v-bind('gridWidth -22 + "px"');
    height: v-bind('gridHeight -22 + "px"');
  }
  &.streamdeck {
    background: #111;
    &:deep(.scene) {
      font-size: 31px;
      grid-gap: 20px;

      .cell,
      .overlay {
        border-radius: 20px;
      }
      .cell:not(.disabled) .button::before {
        border-radius: 15px 15px 0 0;
      }
    }
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
  .form-row:last-of-type {
    border-bottom: 0;
    padding-bottom: 0;
  }
  .form-row:first-of-type {
    padding-top: 0;
  }
  .flex-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .flex-row:last-child {
    margin-bottom: 0;
  }
  .flex-center {
    align-items: center;
  }
  .flex-stretch {
    align-items: stretch;
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
    background:
      url('icons/system-uicons/trash.png') no-repeat center,
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
  .p-tablist {
    background: var(--p-tabs-tablist-background);
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
}
::v-global(button) {
  font-family: inherit;
}
</style>
