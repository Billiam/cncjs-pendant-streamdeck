const state = new WeakMap()

const vPointerHold = {
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

    data.cancel = (e) => {
      if (e) {
        const id = e.pointerId
        if (!pointers.has(id)) {
          return
        }
        pointers.delete(id)
      } else {
        pointers.clear()
      }

      if (pointers.size > 0) {
        return
      }
      document.body.removeEventListener('pointerup', data.cancel)
      clearTimeout(data.timeout)
      if (data.down) {
        data.down = false
        if (binding.value?.up) {
          binding.value.up(e)
        }
      }
    }

    el.addEventListener('pointerdown', (e) => {
      const id = e.pointerId
      pointers.add(id)
      if (data.down) {
        return
      }
      data.down = true
      document.body.addEventListener('pointerup', data.cancel)
      data.timeout = setTimeout(complete, 500)
      if (binding.value?.down) {
        binding.value.down(e)
      }
    })

    const complete = (e) => {
      if (binding.value?.complete) {
        binding.value.complete(e)
      }
    }
  },

  beforeUnmount: (el) => {
    if (state[el]?.cancel) {
      state[el]?.cancel()

      document.body.removeEventListener('pointerup', state[el]?.cancel)
    }
    state.delete(el)
  },
}

export default vPointerHold
