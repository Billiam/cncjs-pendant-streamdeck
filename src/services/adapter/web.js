export const getAccessToken = () => {
  const query = new URLSearchParams(window.location.search)
  if (query.has('token')) {
    return query.get('token')
  }
  const cncConfig = JSON.parse(localStorage.getItem('cnc') || '{}')
  return cncConfig?.state?.session?.token || ''
}

export const fetchConfig = async () => {
  try {
    const response = await fetch('config.json')
    return await response.json()
  } catch (e) {
    // return {}
  }
}

export const getOptions = () => ({})

export const GcodeWorker = () => {
  return new Worker(new URL('../../gcode-worker.js', import.meta.url), {
    type: 'module',
  })
}

export const OutlineWorker = () => {
  return new Worker(new URL('../../outline-worker.js', import.meta.url), {
    type: 'module',
  })
}

export const onWorkerMessage = (fn) => {
  const postMessage = self.postMessage
  self.addEventListener('message', (...args) => {
    fn(postMessage, ...args)
  })
}

export const onWorkerEvent = (worker, event, callback) => {
  worker.addEventListener(event, callback)
}

export const offWorkerEvent = (worker, event, callback) => {
  worker.removeEventListener(event, callback)
}

export const performance = window.performance
