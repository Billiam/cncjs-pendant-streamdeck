import { watch } from 'vue'

import animation from '@/lib/cli/animate'
import { useUiStore } from '@/stores/ui'
import Sleep from '@/lib/cli/sleep'

export const SleepScreen = (timeout, streamdeck) => {
  const ui = useUiStore()
  const sleep = Sleep(timeout)

  let fadeoutAnimation
  watch(sleep.asleep, (asleep) => {
    ui.asleep = asleep
    fadeoutAnimation?.cancel()
    fadeoutAnimation = null
    if (asleep) {
      fadeoutAnimation = animation({
        duration: 800 * ui.displayBrightness * 0.01,
        fps: 30,
        callback: (percent) => {
          streamdeck.setBrightness(
            Math.floor(ui.displayBrightness * (1 - percent))
          )
        },
      })
      fadeoutAnimation.start()
    } else {
      streamdeck.setBrightness(ui.displayBrightness)
    }
  })

  const wake = () => {
    const wasAsleep = ui.asleep
    sleep.clearSleep()
    return wasAsleep
  }

  return { wake }
}
