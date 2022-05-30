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

    const data = state[el]

    data.cancel = (e) => {
      clearTimeout(data.timeout)
      if (data.down) {
        data.down = false
        if (binding.value?.up) {
          binding.value.up(e)
        }
      }
    }

    el.addEventListener('pointerdown', (e) => {
      data.down = true
      data.timeout = setTimeout(complete, 500)
      if (binding.value?.down) {
        binding.value.down(e)
      }
    })

    document.body.addEventListener('pointerup', data.cancel)

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
