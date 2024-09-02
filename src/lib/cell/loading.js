import { useCncStore } from '@/stores/cnc'
import { computed } from 'vue'

export const useLoading = (config) => {
  const cnc = useCncStore()

  const ids = computed(() => {
    if (!config.actions) {
      return []
    }
    return config.actions.reduce((list, action) => {
      if (action.action === 'command' && action.arguments) {
        if (!cnc.commands) {
          return list
        }
        let [id, name] = action.arguments
        if (!id && name) {
          id = cnc.commands?.[name]
        }
        if (id) {
          list.push(id)
        }
      }
      return list
    }, [])
  })
  const workerNames = ['outline']
  const workerActions = computed(() => {
    if (!config.actions) {
      return []
    }
    return config.actions
      .map((action) => action.action)
      .filter((action) => {
        return workerNames.includes(action)
      })
  })

  const loading = computed(() => {
    return (
      workerActions.value.some((id) => cnc.workerRunning(id)) ||
      ids.value.some((id) => cnc.commandRunning(id))
    )
  })

  return { loading }
}
