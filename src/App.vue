<script setup>
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
  <scene v-if="scene" :buttons="scene.buttons"></scene>
  <h1 v-else>Loading...</h1>
</template>

<style>
@import './assets/base.css';
.no-touch {
  touch-action: none;
}
.scene {
  padding: 1px;
  touch-action: pan-x pan-y;

  width: 100vw;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  font-size: 0.5rem;
  display: grid;
  grid-template-columns: v-bind('"repeat(" + columns + ", minmax(0, 1fr))"');
  grid-template-rows: v-bind('"repeat(" + rows + ", minmax(0, 1fr))"');
  grid-gap: 5px;
  align-items: center;
  justify-items: center;
}
.cell {
  width: 100%;
  height: 100%;
  text-align: center;
  border-radius: 5px;
}

.button {
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
}
.button::before {
  content: '';
  background-color: #ffffff33;
  background: linear-gradient(to bottom, #ffffff33 30%, transparent);
  position: absolute;
  top: 3%;
  left: 3%;
  right: 3%;
  height: 20%;
  border-radius: 5px 5px 0 0;
}
.icon {
  filter: drop-shadow(2px 3px 0 #00000022);
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
