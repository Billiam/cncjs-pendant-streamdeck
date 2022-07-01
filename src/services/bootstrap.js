import { useButtonStore } from '@/stores/buttons'
import { useCncStore } from '@/stores/cnc'
import { useFileListStore } from '@/stores/file-list'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'
export default (container) => {
  let stateFeeder
  let cncActions

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
    container.remove('stateFeeder')
    container.remove('cncActions')
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

    // TODO: make home scene configurable or add validation for home
    uiStore.setScene('home')

    uiStore.setPalette(config.ui.palette)
    uiStore.setGrid(config.ui.rows, config.ui.columns)
    uiStore.textColor = config.ui.textColor
    uiStore.textShadow = config.ui.textShadow

    uiStore.setBgColor(config.ui.bgColor)
    uiStore.setProgressColor(config.ui.progressColor)

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

    stateFeeder = await container.get('stateFeeder')
    cncActions = await container.get('cncActions')

    return true
  }

  return {
    start,
    cleanup,
  }
}
