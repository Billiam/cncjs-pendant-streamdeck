export default (token) => {
  const apiFetch = async (path, params) => {
    const fetchParams = new URLSearchParams({
      token,
      ...params,
    })
    const apiUrl = `../api/${path}?${fetchParams}`

    const results = await fetch(apiUrl)
    return results.json()
  }

  return {
    fetch: apiFetch,
  }
}
