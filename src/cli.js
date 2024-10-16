import { openStreamDeck } from '@elgato-stream-deck/node'
import path from 'path'
import { createPinia, setActivePinia } from 'pinia'
import Sharp from 'sharp'
import { computed, ref, watch, watchEffect } from 'vue'

import CliButton from '@/lib/cli/button'
import { SleepScreen } from '@/lib/cli/sleep-screen'
import { arrayWrap } from '@/lib/enumerable'
import { useFileList } from '@/lib/scene/file-list'
import Bootstrap from '@/services/bootstrap'
import Container from '@/services/container'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'

const container = Container()
setActivePinia(createPinia())

const bootstrap = Bootstrap(container)

const getStreamdeck = async () => {
  let streamdeck
  try {
    streamdeck = await openStreamDeck(null, {
      jpegOptions: { quality: 100, subsampling: 0 },
    })
  } catch (e) {
    console.error(e)
    console.error('Could not open Stream Deck')
    process.exit(1)
  }
  return streamdeck
}

const run = async () => {
  const { directory } = await container.get('options')

  let streamdeck
  try {
    ;[, streamdeck] = await Promise.all([bootstrap.start(), getStreamdeck()])
  } catch (e) {
    console.error('Connection error', e)
    process.kill(process.pid, 'SIGINT')
  }

  const { buttons: buttonConfig } = useButtonStore()
  const sceneStore = useScenesStore()
  const ui = useUiStore()
  ui.setWeb(false)
  ui.setIconSize(streamdeck.ICON_SIZE)

  const { ui: uiConfig } = await container.get('config')
  const iconDirectory = path.join(directory, 'icons')
  const { wake } = SleepScreen(uiConfig?.timeout, streamdeck)
  const { buttons: fileListButtons, loadFiles } = useFileList()

  const renderBuffers = Array.from(Array(ui.rows * ui.columns)).map(() => ref())

  renderBuffers.forEach((buffer, index) => {
    watchEffect(() => {
      const result = buffer.value
      if (result) {
        if (import.meta.env.DEV) {
          Sharp(result, {
            raw: {
              width: streamdeck.ICON_SIZE,
              height: streamdeck.ICON_SIZE,
              channels: 4,
            },
          })
            .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
            .toFile(`./debug/${index}.jpg`)
        }
        streamdeck.fillKeyBuffer(index, result, { format: 'rgba' })
      } else {
        streamdeck.clearKey(index)
      }
    })
  })

  const specialScenes = {
    gcodeList: {
      buttons: fileListButtons,
      load: loadFiles,
    },
  }

  const buttons = computed(() => {
    const specialScene = specialScenes[ui.sceneName]
    if (specialScene) {
      specialScene.load?.()
      return specialScene.buttons.value
    } else {
      return sceneStore.scenes[ui.sceneName].buttons
    }
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

  //create index of buttons
  const sceneButtons = ref({})
  watch(
    buttons,
    () => {
      const buttonList = {}

      eachButton((key, buttonId) => {
        const config =
          typeof buttonId === 'string' ? buttonConfig[buttonId] : buttonId

        const button = new CliButton(key, config, {
          size: streamdeck.ICON_SIZE,
          buttonActions,
          iconDirectory,
          throttle: ui.throttle,
        })

        //iterate over all rows/columns of button
        for (let subR = 0; subR < (config.rows ?? 1); subR++) {
          for (let subC = 0; subC < (config.columns ?? 1); subC++) {
            const subOffset = subC + subR * (config.columns ?? 1)
            const globalKey = key + subR * ui.columns + subC

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

      sceneButtons.value = Object.freeze(buttonList)
    },
    { immediate: true },
  )

  const effectiveButtons = computed(() => {
    return Object.entries(sceneButtons.value).reduce(
      (buttonList, [index, buttons]) => {
        buttonList[index] = buttons
          .slice()
          .reverse()
          .find((buttonPosition) => buttonPosition.button.show.value)
        return buttonList
      },
      {},
    )
  })
  watch(sceneButtons, (current, previous) => {
    Object.values(previous).forEach((position) => {
      position.forEach((button) => {
        button.button?.cleanup()
      })
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
        buffer.value = newBuffer
      }
    })
  })

  watchEffect(() => {
    streamdeck.setBrightness(ui.displayBrightness)
  })

  streamdeck.on('down', (keyIndex) => {
    if (wake()) {
      return
    }
    const button = effectiveButtons.value[keyIndex]
    if (!button) {
      return
    }
    button.button.down()
  })

  streamdeck.on('up', (keyIndex) => {
    if (wake()) {
      return
    }
    const button = effectiveButtons.value[keyIndex]
    if (!button) {
      return
    }
    button.button.up()
    ui.activity()
  })
}

run()
