import { useButtonStore } from '@/stores/buttons'
import { useCncStore } from '@/stores/cnc'
import { useConnectionStore } from '@/stores/connection'
import { useScenesStore } from '@/stores/scenes'
import { useUiStore } from '@/stores/ui'

export const buildConfig = () => {
  const buttons = useButtonStore()
  const scenes = useScenesStore()
  const connection = useConnectionStore()
  const cnc = useCncStore()
  const ui = useUiStore()

  const config = {}
  config.buttons = buttons.buttons
  config.cncjs = connection.output

  config.machine = cnc.output
  config.scenes = scenes.scenes
  config.streamdeckUi = ui.streamdeckOutput
  config.ui = ui.output

  return config
}

export const saveConfig = () => {
  const config = buildConfig()

  const output = JSON.stringify(config, null, 2)

  const blob = new Blob([output], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'config.json'
  link.click()
  URL.revokeObjectURL(link.href)
}
