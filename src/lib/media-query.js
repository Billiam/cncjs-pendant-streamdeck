import { onMounted, onUnmounted, ref, watch } from 'vue'

export const useMediaQuery = (condition) => {
  const match = ref(false)
  let media

  const mediaChanged = (event) => {
    match.value = event.matches
  }
  const clearListener = () => {
    if (media) {
      media.removeEventListener('change', mediaChanged)
    }
  }
  const startListener = () => {
    media = window.matchMedia(condition.value)
    match.value = media.matches

    media.addEventListener('change', mediaChanged)
  }

  onMounted(() => {
    watch(
      condition,
      () => {
        clearListener()
        startListener()
      },
      { immediate: true },
    )
  })
  onUnmounted(clearListener)

  return { match }
}
