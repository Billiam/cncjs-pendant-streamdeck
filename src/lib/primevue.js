import { theme } from '@/lib/primevue-theme'

import { usePrimeVue } from 'primevue/config'

export const usePrimevue = () => {
  const primevue = usePrimeVue()
  primevue.config.theme = { preset: theme }
}
