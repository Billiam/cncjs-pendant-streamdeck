import { computed } from 'vue'

import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'

import FileListScene from '@/components/FileListScene.vue'
import Scene from '@/components/Scene.vue'

export const useDynamicScene = () => {
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
    () => specialScenes[uiStore.sceneName]?.type ?? Scene,
  )

  const scene = computed(() => {
    return (
      specialScenes[uiStore.sceneName] ?? sceneStore.scenes[uiStore.sceneName]
    )
  })

  return { scene, sceneType }
}
