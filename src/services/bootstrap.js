import { useButtonStore } from '@/stores/buttons'
import { useCncStore } from '@/stores/cnc'
import { useConnectionStore } from '@/stores/connection'
import { useFileListStore } from '@/stores/file-list'
import { useScenesStore } from '@/stores/scenes'
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
      (busName) => container.get(busName),
    )
    const busses = await Promise.all(busPromises)
    busses.forEach((bus) => bus.all.clear())

    stateFeeder?.destroy()
    buttonActions?.destroy()

    container.clearCache()
  }

  const initializeStores = async () => {
    const uiStore = useUiStore()
    const cncStore = useCncStore()
    const connectionStore = useConnectionStore()
    const buttonStore = useButtonStore()
    const sceneStore = useScenesStore()

    const config = (await container.get('config')) ?? {}

    // initialize stores from config data
    buttonStore.setButtons(config.buttons)
    sceneStore.setScenes(config.scenes)

    cncStore.setAxes(config.machine?.axes)
    cncStore.setAxisSpeeds(config.machine?.axisSpeeds)

    // TODO: make home scene configurable
    uiStore.setScene('home')
    const uiConfig = { ...config.ui }

    uiStore.setStreamdeckConfig(config.streamdeckUi)

    uiStore.setBrightness(uiConfig.brightness)
    uiStore.setPalette(uiConfig.palette)
    uiStore.setGrid(uiConfig.rows, uiConfig.columns)
    uiStore.setThrottle(uiConfig.throttle)
    uiStore.setGcodeLimit(uiConfig.gcodeLimit)
    uiStore._textColor = uiConfig.textColor ?? uiStore._textColor
    uiStore._textShadow = uiConfig.textShadow
    uiStore._font = uiConfig.font ?? uiStore._font
    uiStore._fontSize = uiConfig.fontSize ?? uiStore._fontSize
    uiStore._lineHeight = uiConfig.lineHeight ?? uiStore._lineHeight
    uiStore._pageColor = uiConfig.pageColor ?? uiStore._pageColor
    uiStore.setGcodeColors(uiConfig.gcodeColors)
    uiStore.setBgColor(uiConfig.bgColor)
    uiStore.setProgressColor(uiConfig.progressColor)
    connectionStore.setConfig({ ...config.cncjs })

    await connectListeners()

    return true
  }

  const connectListeners = async () => {
    const cncStore = useCncStore()
    const fileListStore = useFileListStore()

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
    try {
      const socket = await container.get('socket')
      await socket.connect()
    } catch (e) {
      console.error('socket connection failed', e)
    }

    ;[stateFeeder, cncActions, buttonActions] = await Promise.all([
      container.get('stateFeeder'),
      container.get('cncActions'),
      container.get('buttonActions'),
    ])
  }

  return {
    addConnectionListeners,
    cleanup,
    connectListeners,
    start,
  }
}
