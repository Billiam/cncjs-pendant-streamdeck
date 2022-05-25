<script setup>
import Scene from '@/components/Scene.vue'
import FixedHeight from '@/components/FixedHeight.vue'
import ContextMenu from '@/components/ContextMenu.vue'

import CncActions from '@/lib/cnc-actions'
import openConnection from '@/lib/connection'
import StateFeeder from '@/lib/state-feeder'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount } from 'vue'

const uiStore = useUiStore()
const buttonStore = useButtonStore()
const sceneStore = useScenesStore()

const { rows, columns } = storeToRefs(uiStore)

const scene = computed(() => {
  return sceneStore.scenes[uiStore.sceneName]
})

onBeforeMount(async () => {
  const response = await fetch('config.json')
  const config = await response.json()

  buttonStore.setButtons(Object.freeze(config.buttons))
  sceneStore.setScenes(Object.freeze(config.scenes))

  uiStore.setScene('home')

  uiStore.setGrid(config.ui.rows, config.ui.columns)
  uiStore.setBgColor(config.ui.bgColor)
  uiStore.setActiveBgColor(config.ui.activeBgColor)
  uiStore.setPalette(config.ui.palette)

  openConnection(config.cncjs, (err, { socket, options }) => {
    console.log({ err })
    if (err) {
      console.error(err)
      return
    }

    StateFeeder(socket)

    const cncActions = CncActions(socket, options)
  })
})
</script>

<template>
  <fixed-height></fixed-height>
  <context-menu></context-menu>
  <scene v-if="scene" :buttons="scene.buttons"></scene>
  <h1 v-else>Loading...</h1>
</template>

<style>
@import './assets/base.css';
.no-touch {
  touch-action: none;
}
.scene {
  touch-action: pan-x pan-y;

  width: 100vw;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;

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
}

.button {
  overflow: hidden;
  width: 100%;
  height: 100%;

  border-radius: 5px;
}
</style>
