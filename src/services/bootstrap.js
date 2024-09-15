import { useFileListStore } from '@/stores/file-list'
import { useButtonStore } from '@/stores/buttons'
import { useScenesStore } from '@/stores/scenes'
import { useCncStore } from '@/stores/cnc'
import { useUiStore } from '@/stores/ui'

export default (container) => {
  let stateFeeder
  let cncActions
  let buttonActions

  const start = async () => {
    await initializeStores()
    return addConnectionListeners()
  }

  const addConnectionListeners = async () => {
    const connection = await container.get('connection')
    const connectionBus = await container.get('connectionBus')
    connectionBus.on('connect', () => {
      connection.openSerialPort()
    })
  }

  const cleanup = async () => {
    const busPromises = ['actionBus', 'ackBus', 'connectionBus'].map(
      (busName) => container.get(busName)
    )
    const busses = await Promise.all(busPromises)
    busses.forEach((bus) => bus.all.clear())

    stateFeeder?.destroy()
    buttonActions?.destroy()

    container.remove('stateFeeder')
    container.remove('cncActions')
    container.remove('buttonActions')
  }

  const initializeStores = async () => {
    const uiStore = useUiStore()
    const cncStore = useCncStore()
    const fileListStore = useFileListStore()
    const buttonStore = useButtonStore()
    const sceneStore = useScenesStore()

    const config = await container.get('config')

    // initialize stores from config data
    buttonStore.setButtons(Object.freeze(config.buttons))
    sceneStore.setScenes(Object.freeze(config.scenes))
    cncStore.setAxes(config.machine?.axes)

    // TODO: make home scene configurable
    uiStore.setScene('home')
    const uiConfig = { ...config.ui }

    if (import.meta.env.SSR) {
      Object.assign(uiConfig, config.streamdeckUi || {})
    }

    uiStore.setBrightness(uiConfig.brightness)
    uiStore.setPalette(uiConfig.palette)
    uiStore.setGrid(uiConfig.rows, uiConfig.columns)
    uiStore.setThrottle(uiConfig.throttle)
    uiStore.setGcodeLimit(uiConfig.gcodeLimit)
    uiStore.textColor = uiConfig.textColor ?? uiStore.textColor
    uiStore.textShadow = uiConfig.textShadow
    uiStore.font = uiConfig.font ?? uiStore.font
    uiStore.fontSize = uiConfig.fontSize ?? uiStore.fontSize
    uiStore.lineHeight = uiConfig.lineHeight ?? uiStore.lineHeight
    uiStore.pageColor = uiConfig.pageColor ?? uiStore.pageColor
    uiStore.setGcodeColors(uiConfig.gcodeColors)
    uiStore.setBgColor(uiConfig.bgColor)
    uiStore.setProgressColor(uiConfig.progressColor)

    // more store population
    await Promise.all([
      (async () => {
        const apiClient = await container.get('cncApi')
        fileListStore.setClient(apiClient)
        cncStore.setClient(apiClient)
      })(),
      (async () => {
        const token = await container.get('accessToken')
        cncStore.setToken(token)
      })(),
    ])
    const socket = await container.get('socket')
    try {
      await socket.connect()
    } catch (e) {
      console.error('socket failed')
    }

    ;[stateFeeder, cncActions, buttonActions] = await Promise.all([
      container.get('stateFeeder'),
      container.get('cncActions'),
      container.get('buttonActions'),
    ])

    return true
  }

  return {
    cleanup,
    start,
  }
}
