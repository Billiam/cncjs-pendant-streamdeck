let fetchImplementation

if (import.meta.env.SSR) {
  fetchImplementation = require('node-fetch')
} else {
  fetchImplementation = window.fetch
}

export default (token, host, port, secure) => {
  const url = (path, params) => {
    const queryParams = new URLSearchParams({
      token,
      ...params,
    })
    return `${
      secure ? 'https' : 'http'
    }://${host}:${port}/api/${path}?${queryParams}`
  }

  const apiFetch = async (path, params) => {
    const fetchUrl = url(path, params)
    const results = await fetchImplementation(fetchUrl)
    return results.json()
  }

  const apiPost = async (path, params, formData = null, file = null) => {
    const postUrl = url(path, params)

    let bodyData = null

    if (formData || file) {
      bodyData = new FormData()
      if (file) {
        bodyData.append(file.field, file.file, file.name)
      }
      if (formData) {
        Object.entries(formData).forEach(([key, value]) => {
          bodyData.append(key, value)
        })
      }
    }
    const results = await fetchImplementation(postUrl, {
      method: 'POST',
      body: bodyData,
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${token}`,
      },
    })
    return results.json()
  }

  return {
    fetch: apiFetch,
    post: apiPost,
  }
}
