export default (duration, fps, callback) => {
  let timeout
  let startTime
  const delayTime = 1000 / fps

  const percentCallback = () => {
    const percent = Math.max(
      0,
      Math.min(1, (Date.now() - startTime) / duration)
    )
    console.log({ percent })
    callback(percent)
    if (percent < 1) {
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
