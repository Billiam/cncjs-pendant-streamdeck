import Container from '@/services/container'
import Bootstrap from '@/services/bootstrap'
import { openStreamDeck } from '@elgato-stream-deck/node'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'
import { computed, ref, watch, watchEffect } from 'vue'
import { arrayWrap } from '@/lib/enumerable'
import { createPinia, setActivePinia } from 'pinia'
import CliButton from '@/lib/cli/button'
import Sharp from 'sharp'

const container = Container()
setActivePinia(createPinia())

const bootstrap = Bootstrap(container)

const run = async () => {
  await bootstrap.start()

  const streamdeck = await openStreamDeck(null, {
    jpegOptions: { quality: 100, subsampling: 0 },
  })

  const { buttons: buttonConfig } = useButtonStore()
  const sceneStore = useScenesStore()
  const ui = useUiStore()
  ui.setWeb(false)
  ui.setIconSize(streamdeck.ICON_SIZE)

  const renderBuffers = Array.from(Array(ui.rows * ui.columns)).map(() => ref())

  renderBuffers.forEach((buffer, index) => {
    watchEffect(() => {
      const result = buffer.value
      if (result) {
        Sharp(result, {
          raw: {
            width: streamdeck.ICON_SIZE,
            height: streamdeck.ICON_SIZE,
            channels: 4,
          },
        })
          .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
          .toFile(`./debug/${index}.jpg`)
        streamdeck.fillKeyBuffer(index, result, { format: 'rgba' })
      } else {
        streamdeck.clearKey(index)
      }
    })
  })

  // TODO: Extract special file list scene to a thing that just returns buttons
  // TODO: Extract "buttons" to ui store
  const buttons = computed(() => {
    return sceneStore.scenes[ui.sceneName].buttons
  })

  const buttonActions = ref()
  container.get('buttonActions').then((actions) => {
    buttonActions.value = actions
  })

  const eachButton = (callback) => {
    buttons.value.forEach((row, r) => {
      row.forEach((position, c) => {
        const key = r * ui.columns + c
        arrayWrap(position).forEach((buttonId) => {
          if (buttonId == null) {
            return
          }
          callback(key, buttonId)
        })
      })
    })
  }

  const sceneButtons = computed(() => {
    //create index of buttons
    const buttonList = {}

    eachButton((key, buttonId) => {
      const config = buttonConfig[buttonId]

      const button = new CliButton(key, config, {
        size: streamdeck.ICON_SIZE,
        buttonActions,
      })

      //iterate over all rows/columns of button
      for (let subR = 0; subR < (config.rows ?? 1); subR++) {
        for (let subC = 0; subC < (config.columns ?? 1); subC++) {
          const subOffset = subC + subR * (config.columns ?? 1)
          const globalKey = key + subR + subC * ui.columns

          buttonList[globalKey] ??= []
          buttonList[globalKey].push({
            row: subR,
            column: subC,
            offset: subOffset,
            button,
          })
        }
      }
    })

    return Object.freeze(buttonList)
  })

  const effectiveButtons = computed(() => {
    return Object.entries(sceneButtons.value).reduce(
      (buttonList, [index, buttons]) => {
        buttonList[index] = buttons
          .slice()
          .reverse()
          .find((buttonPosition) => buttonPosition.button.show.value)
        return buttonList
      },
      {}
    )
  })
  watch(effectiveButtons, (current, previous) => {
    Object.entries(previous).forEach(([index, button]) => {
      if (button && button !== current[index]) {
        // unload button
        button?.button?.cleanup?.()
      }
    })
  })

  renderBuffers.forEach((buffer, index) => {
    watchEffect(() => {
      const button = effectiveButtons.value[index]
      const newBuffer = button?.button?.buffers?.[button?.offset]?.value
      // TODO: non-flashing redraw on swapscene only
      if (
        !buffer.value ||
        !button?.button?.show?.value ||
        (newBuffer && !newBuffer.equals(buffer.value))
      ) {
        if (newBuffer && buffer.value) {
        }
        buffer.value = newBuffer
      }
    })
  })

  watchEffect(() => {
    streamdeck.setBrightness(ui.displayBrightness)
  })

  streamdeck.on('down', (keyIndex) => {
    const button = effectiveButtons.value[keyIndex]
    if (!button) {
      return
    }
    button.button.down()
  })

  streamdeck.on('up', (keyIndex) => {
    const button = effectiveButtons.value[keyIndex]
    if (!button) {
      return
    }
    button.button.up()
    ui.activity()
  })
}

run()
