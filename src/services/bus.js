import mitt from 'mitt'
export default () => {
  const inst = mitt()
  return {
    on: inst.on,
    off: inst.off,
    emit: inst.emit,
    clear: inst.all.clear,
    once: (type, fn) => {
      const cb = () => {
        inst.off(type, cb)
        fn()
      }
      return inst.on(type, cb)
    },
  }
}
