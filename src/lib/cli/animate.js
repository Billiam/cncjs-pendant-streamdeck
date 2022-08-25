export default ({ duration, fps, loop = false, callback }) => {
  let timeout
  let startTime
  const delayTime = 1000 / fps
  const max = loop ? Infinity : 1
  const percentCallback = () => {
    const percent = Math.max(
      0,
      Math.min(max, (Date.now() - startTime) / duration)
    )
    callback(percent % 1)
    if (percent < 1 || loop) {
      run()
    }
  }

  const run = () => {
    timeout = setTimeout(percentCallback, delayTime)
  }

  const cancel = () => {
    clearTimeout(timeout)
  }

  const start = () => {
    cancel()
    startTime = Date.now()
    run()
  }

  const delay = (when) => {
    timeout = setTimeout(start, when - delayTime)
  }

  return {
    start,
    delay,
    cancel,
  }
}
