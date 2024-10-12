export const arrayWrap = (n) => {
  if (Array.isArray(n)) {
    return n
  } else {
    if (n == null) {
      return []
    }
    return [n]
  }
}
