import mitt from 'mitt'
const inst = mitt()

export default {
  on: inst.on,
  off: inst.off,
  emit: inst.emit,
  once: (type, fn) => {
    const cb = () => {
      inst.off(type, cb)
      fn()
    }
    return inst.on(type, cb)
  },
}
