let fetchImplementation

if (import.meta.env.SSR) {
  fetchImplementation = require('node-fetch')
} else {
  fetchImplementation = window.fetch
}

export default (token, host, port) => {
  const apiFetch = async (path, params) => {
    const fetchParams = new URLSearchParams({
      token,
      ...params,
    })
    const apiUrl = `http://${host}:${port}/api/${path}?${fetchParams}`

    const results = await fetchImplementation(apiUrl)
    return results.json()
  }

  return {
    fetch: apiFetch,
  }
}
