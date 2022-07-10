import { ref } from 'vue'

export default (delay) => {
  let timeout

  const asleep = ref(false)
  const beginTimeout = () => {
    if (!delay) {
      return
    }
    timeout = setTimeout(() => {
      asleep.value = true
    }, delay * 1000)
  }
  const clearSleep = () => {
    if (asleep.value) {
      asleep.value = false
    }
    clearTimeout(timeout)
    beginTimeout()
  }

  beginTimeout()
  return {
    clearSleep,
    asleep,
  }
}
