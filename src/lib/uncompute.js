// eager load conditional computed values for caching/reactivity
export default (computed) =>
  Object.entries(computed).reduce((obj, [name, computed]) => {
    obj[name] = computed.value
    return obj
  }, {})
