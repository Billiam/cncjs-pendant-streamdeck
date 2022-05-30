const storageKey = Symbol()

const vPointerUpOutside = {
  mounted: (el, binding) => {
    el[storageKey] = (event) => {
      const handler = binding.value

      if (!el.contains(event.target)) {
        handler(event)
      }
    }
    document.body.addEventListener('pointerup', el[storageKey])
  },
  beforeUnmount: (el) => {
    document.body.removeEventListener('pointerup', el[storageKey])
  },
}
export default vPointerUpOutside
