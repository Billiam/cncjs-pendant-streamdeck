import { computed } from 'vue'

export const isUuid = (value) =>
  /[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)

export const useUuidModel = (idModel, nameModel) => {
  const uuidArray = computed({
    get() {
      return idModel.value || nameModel.value
    },
    set(value) {
      if (isUuid(value)) {
        idModel.value = value
        nameModel.value = null
      } else {
        idModel.value = null
        nameModel.value = value
      }
    },
  })

  return { uuidArray }
}
