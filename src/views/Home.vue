<script>
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import { useDynamicScene } from '@/lib/dynamic-scene'
import { useCncStore } from '@/stores/cnc'

import FixedHeight from '@/components/FixedHeight.vue'
</script>
<script setup>
const { scene, sceneType } = useDynamicScene()
const cnc = useCncStore()
const { configMissing } = storeToRefs(cnc)
</script>

<template>
  <fixed-height></fixed-height>
  <component v-if="scene" :is="sceneType" :buttons="scene.buttons"></component>
  <div class="status" v-if="configMissing">
    <h1 class="message">
      <span> Config file (config.json) could not be found </span>
    </h1>
  </div>
</template>

<style scoped>
.status {
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  height: 100vh;
}
</style>
