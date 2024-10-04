<script>
import { computed, provide } from 'vue'

import Bootstrap from '@/services/bootstrap'
import Container from '@/services/container'
import { useUiStore } from '@/stores/ui'

import Theme from '@/components/Theme.vue'
</script>

<script setup>
const container = Container()
const bootstrap = Bootstrap(container)
provide('container', container)

import { onMounted, onBeforeUnmount, provide, ref } from 'vue'
import { storeToRefs } from 'pinia'

const uiStore = useUiStore()

const { rows, columns } = storeToRefs(uiStore)
const buttonActions = ref()
container.get('buttonActions').then((handler) => {
  buttonActions.value = handler
})
container.register('bootstrap', bootstrap, { type: 'static' })
provide('buttonActions', buttonActions)

onMounted(async () => {
  bootstrap.start()
})

onBeforeUnmount(() => {
  bootstrap.cleanup()
})

const smallFontSize = computed(() => {
  return `${12.5 / columns.value}vw`
})
const fontSize = computed(() => {
  return `${14.5 / columns.value}vw`
})
</script>

<template>
  <router-view />
  <theme></theme>
</template>

<style>
/* TODO: un-inline */
@import './assets/base.css';
.no-touch {
  touch-action: none;
}
html,
body,
#app {
  height: 100%;
}
.status {
  height: 100%;
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
  font-size: v-bind(smallFontSize);
  display: grid;
  grid-template-columns: v-bind('"repeat(" + columns + ", 1fr)"');
  grid-template-rows: v-bind('"repeat(" + rows + ", minmax(0, 1fr))"');
  grid-gap: 5px;
  align-items: center;
  justify-items: center;

  overflow: hidden;
  min-width: 0;
  transition: grid-gap 0.2s;
}
.cell {
  width: 100%;
  height: 100%;
  text-align: center;
  border-radius: 5px;

  min-width: 0;
  overflow: hidden;

  transition: border-radius 0.5s;
}
div.p-component.p-drawer {
  width: 30rem;
}
@media (min-width: 30em) and (min-height: 20em) {
  .scene {
    font-size: v-bind(smallFontSize);
  }
}
</style>
