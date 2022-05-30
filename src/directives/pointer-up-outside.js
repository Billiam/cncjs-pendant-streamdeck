const vPointerUpOutside = {
  mounted: (el, binding) => {
    el.pointerUpOutside = (event) => {
      const handler = binding.value

      if (!el.contains(event.target)) {
        handler(event)
      }
    }
    document.body.addEventListener('pointerup', el.pointerUpOutside)
  },
  beforeUnmount: (el) => {
    document.body.removeEventListener('pointerup', el.pointerUpOutside)
  },
}
export default vPointerUpOutside
