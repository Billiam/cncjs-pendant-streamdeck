<script setup>
import AutoFullscreen from '@/components/AutoFullscreen.vue'
import Scene from '@/components/Scene.vue'
import FixedHeight from '@/components/FixedHeight.vue'

import Bus from '@/services/bus'
import ButtonHandler from '@/services/button-handler'
import CncActions from '@/lib/cnc-actions'
import Connection from '@/lib/connection'
import StateFeeder from '@/lib/state-feeder'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'
import { useCncStore } from '@/stores/cnc'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onBeforeUnmount, provide } from 'vue'

const uiStore = useUiStore()
const cncStore = useCncStore()
const buttonStore = useButtonStore()
const sceneStore = useScenesStore()

const ackBus = Bus()
const actionBus = Bus()

let currentSocket
let stateFeeder
let cncActions

const { rows, columns } = storeToRefs(uiStore)

const scene = computed(() => {
  return sceneStore.scenes[uiStore.sceneName]
})

const clearEventlisteners = () => {
  ackBus.all.clear()
  actionBus.all.clear()
  stateFeeder?.destroy()
}

provide('buttonHandler', ButtonHandler(actionBus))

onBeforeMount(async () => {
  const response = await fetch('config.json')
  const config = await response.json()

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

  const connection = new Connection(config.cncjs)
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

  cncStore.setConnected(true)
  stateFeeder = StateFeeder(socket, ackBus)
  cncActions = CncActions(socket, connection.options, actionBus, ackBus)
})

onBeforeUnmount(() => {
  clearEventlisteners()
})
</script>

<template>
  <fixed-height></fixed-height>
  <auto-fullscreen></auto-fullscreen>
  <scene v-if="scene" :buttons="scene.buttons"></scene>
  <h1 v-else>Loading...</h1>
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
@media (min-width: 50em) and (min-height: 35em) {
  .scene {
    font-size: 2rem;
  }
}
</style>
