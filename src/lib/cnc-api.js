let fetchImplementation

if (import.meta.env.SSR) {
  fetchImplementation = require('node-fetch')
} else {
  fetchImplementation = window.fetch
}

export default (token, host, port) => {
  const url = (path, params) => {
    const queryParams = new URLSearchParams({
      token,
      ...params,
    })
    return `http://${host}:${port}/api/${path}?${queryParams}`
  }

  const apiFetch = async (path, params) => {
    const fetchUrl = url(path, params)
    const results = await fetchImplementation(fetchUrl)
    return results.json()
  }

  const apiPost = async (path, params) => {
    const postUrl = url(path, params)
    const results = await fetchImplementation(postUrl, { method: 'POST' })
    return results.json()
  }

  return {
    fetch: apiFetch,
    post: apiPost,
  }
}
