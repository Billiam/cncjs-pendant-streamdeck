<script setup>
import AutoFullscreen from '@/components/AutoFullscreen.vue'
import Scene from '@/components/Scene.vue'
import FixedHeight from '@/components/FixedHeight.vue'
import FileListScene from '@/components/FileListScene.vue'

import Bus from '@/services/bus'
import ButtonHandler from '@/services/button-handler'
import CncActions from '@/lib/cnc-actions'
import Connection from '@/lib/connection'
import StateFeeder from '@/lib/state-feeder'
import CncApi from '@/lib/cnc-api'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'
import { useCncStore } from '@/stores/cnc'
import { useFileListStore } from '@/stores/file-list'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onBeforeUnmount, provide, ref } from 'vue'

const uiStore = useUiStore()
const cncStore = useCncStore()
const fileListStore = useFileListStore()
const buttonStore = useButtonStore()
const sceneStore = useScenesStore()

const ackBus = Bus()
const actionBus = Bus()

let stateFeeder
let cncActions

const { rows, columns } = storeToRefs(uiStore)
const configError = ref(false)

const specialScenes = {
  gcodeList: {
    type: FileListScene,
    buttons: [],
  },
}

const scene = computed(() => {
  return (
    specialScenes[uiStore.sceneName] ?? sceneStore.scenes[uiStore.sceneName]
  )
})

const clearEventlisteners = () => {
  ackBus.all.clear()
  actionBus.all.clear()
  stateFeeder?.destroy()
}

const getToken = () => {
  const query = new URLSearchParams(window.location.search)
  if (query.has('token')) {
    return query.get('token')
  }
  const cncConfig = JSON.parse(localStorage.getItem('cnc') || '{}')
  return cncConfig?.state?.session?.token || ''
}

provide('buttonHandler', ButtonHandler(actionBus))

onBeforeMount(async () => {
  // bootstrap.start()

  const response = await fetch('config.json')
  let config
  try {
    config = await response.json()
  } catch (e) {
    configError.value = true
    return
  }
  // initialize stores from config data
  buttonStore.setButtons(Object.freeze(config.buttons))
  sceneStore.setScenes(Object.freeze(config.scenes))

  // TODO: make home scene configurable or add validation for home
  uiStore.setScene('home')

  uiStore.setPalette(config.ui.palette)
  uiStore.setGrid(config.ui.rows, config.ui.columns)
  uiStore.textColor = config.ui.textColor
  uiStore.textShadow = config.ui.textShadow

  uiStore.setBgColor(config.ui.bgColor)
  uiStore.setProgressColor(config.ui.progressColor)
  const token = getToken()

  const apiClient = CncApi(token, config.cncjs.socketAddress)

  const connection = new Connection(config.cncjs, token)
  if (import.meta.env.DEV) {
    connection.debug()
  }

  let socket
  try {
    ;({ socket } = await connection.connect())
  } catch (err) {
    console.error(err)
    return
  }

  fileListStore.setClient(apiClient)

  cncStore.setToken(token)
  cncStore.setConnected(true)
  stateFeeder = StateFeeder(socket, ackBus)
  cncActions = CncActions(socket, connection.options, actionBus, ackBus)
})

onBeforeUnmount(() => {
  //bootstrap.cleanup()
  clearEventlisteners()
})
const sceneType = computed(
  () => specialScenes[uiStore.sceneName]?.type ?? Scene
)
</script>

<template>
  <fixed-height></fixed-height>
  <auto-fullscreen></auto-fullscreen>
  <component v-if="scene" :is="sceneType" :buttons="scene.buttons"></component>
  <div v-else>
    <h1 v-if="configError">
      Config file (public/config.json) could not be loaded
    </h1>
    <h1 v-else>Loading...</h1>
  </div>
</template>

<style>
@import './assets/base.css';
.no-touch {
  touch-action: none;
}
.html,
body,
#app {
  height: 100%;
}
.scene {
  padding: 1px;
  height: 100%;
  font-size: 0.5rem;
  display: grid;
  grid-template-columns: v-bind('"repeat(" + columns + ", minmax(0, 1fr))"');
  grid-template-rows: v-bind('"repeat(" + rows + ", minmax(0, 1fr))"');
  grid-gap: 5px;
  align-items: center;
  justify-items: center;

  min-width: 0;
}
.cell {
  width: 100%;
  height: 100%;
  text-align: center;
  border-radius: 5px;

  min-width: 0;
  overflow: hidden;
}
@media (min-width: 30em) and (min-height: 20em) {
  .scene {
    font-size: 1rem;
  }
}
@media (min-width: 50em) and (min-height: 45em) {
  .scene {
    font-size: 2rem;
  }
}
</style>
