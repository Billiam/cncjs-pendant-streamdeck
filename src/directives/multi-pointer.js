const state = new WeakMap()

const vMultiPointer = {
  created: (el) => {
    state[el] = { down: false }
  },

  beforeMount: (el, binding) => {
    if (!binding.value) {
      state.delete(el)
      return
    }

    const pointers = new Set()
    const data = state[el]

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) {
        return
      }
      const id = e.pointerId
      pointers.add(id)
      if (data.down) {
        return
      }

      data.down = true
      document.body.addEventListener('pointerup', data.bodyRelease)
      binding.value?.down?.(e)
    })

    el.addEventListener('pointerup', (e) => {
      if (!checkReleaseEvent(e)) {
        return
      }

      const coordinatesContained =
        e.offsetY >= 0 &&
        e.offsetY <= el.offsetHeight &&
        e.offsetX >= 0 &&
        e.offsetX <= el.offsetWidth

      if (!coordinatesContained) {
        data.cancel()
        return
      }
      data.down = false
      document.body.removeEventListener('pointerup', data.bodyRelease)
      binding.value?.up?.(e)
    })

    el.addEventListener('pointercancel', data.bodyRelease)

    const checkReleaseEvent = (e) => {
      // release when button is not down
      if (!data.down) {
        return
      }
      const id = e.pointerId
      if (!pointers.has(id)) {
        // release of another finger not related to current button
        return
      }
      pointers.delete(id)

      // some finger released related to button, but other buttons still holding
      if (pointers.size > 0) {
        return
      }

      return true
    }

    data.bodyRelease = (e) => {
      if (!checkReleaseEvent(e)) {
        return
      }

      binding.value?.up?.(e)
      data.cancel()
    }
  },

  beforeUnmount: (el) => {
    if (state[el].down) {
      state[el].cancel()
    }
    document.body.removeEventListener('pointerup', state[el]?.bodyRelease)
    state.delete(el)
  },
}

export default vMultiPointer
