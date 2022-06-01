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
      const id = e.pointerId
      pointers.add(id)
      if (data.down) {
        return
      }

      data.down = true
      document.body.addEventListener('pointerup', data.release)
      if (binding.value?.down) {
        binding.value.down(e)
      }
    })

    data.cancel = () => {
      data.down = false
      if (binding.value?.cancel) {
        binding.value.cancel()
      }
    }

    data.release = (e) => {
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

      data.down = false
      document.body.removeEventListener('pointerup', data.release)
      const inside = el.contains(e.target)
      if (inside) {
        if (binding.value?.up) {
          binding.value.up(e)
        }
      } else {
        if (binding.value?.cancel) {
          binding.value.cancel()
        }
      }
    }
  },

  beforeUnmount: (el) => {
    if (state[el].down) {
      state[el].cancel()
    }
    document.body.removeEventListener('pointerup', state[el]?.release)
    state.delete(el)
  },
}

export default vMultiPointer
