<script>
import { ref } from 'vue'

import { useDynamicScene } from '@/lib/dynamic-scene'

import FixedHeight from '@/components/FixedHeight.vue'
</script>
<script setup>
const { scene, sceneType } = useDynamicScene()

const configError = ref(false)
</script>

<template>
  <fixed-height></fixed-height>
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
