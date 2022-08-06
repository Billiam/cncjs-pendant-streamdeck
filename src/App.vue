<script setup>
import AutoFullscreen from '@/components/AutoFullscreen.vue'
import Scene from '@/components/Scene.vue'
import FixedHeight from '@/components/FixedHeight.vue'
import FileListScene from '@/components/FileListScene.vue'
import Container from '@/services/container'
import Bootstrap from '@/services/bootstrap'
import { getActivePinia } from 'pinia'

import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'

const container = Container()
const bootstrap = Bootstrap(container)

import { storeToRefs } from 'pinia'
import { computed, onMounted, onBeforeUnmount, provide, ref } from 'vue'

const uiStore = useUiStore()
const sceneStore = useScenesStore()

// needs to be shared with CLI
const specialScenes = {
  gcodeList: {
    type: FileListScene,
    buttons: [],
  },
}
const sceneType = computed(
  () => specialScenes[uiStore.sceneName]?.type ?? Scene
)

const { rows, columns } = storeToRefs(uiStore)
const configError = ref(false)

const scene = computed(() => {
  return (
    specialScenes[uiStore.sceneName] ?? sceneStore.scenes[uiStore.sceneName]
  )
})

const buttonActions = ref()
container.get('buttonActions').then((handler) => {
  buttonActions.value = handler
})
provide('buttonActions', buttonActions)

onMounted(async () => {
  bootstrap.start()
})

onBeforeUnmount(() => {
  bootstrap.cleanup()
})
</script>

<template>
  <fixed-height></fixed-height>
  <auto-fullscreen></auto-fullscreen>
  <component v-if="scene" :is="sceneType" :buttons="scene.buttons"></component>
  <div class="status" v-else>
    <h1 class="message">
      <span v-if="configError">
        Config file (config.json) could not be loaded
      </span>
      <span v-else>Loading...</span>
    </h1>
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
  height: 100vh;
}
.status {
  height: 100vh;
}
.message {
  text-align: center;
  position: relative;
  top: 50%;
  margin: 0 auto;
  transform: translateY(-50%);
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
