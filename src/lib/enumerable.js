export const arrayWrap = (n) => {
  if (Array.isArray(n)) {
    return n
  } else {
    return [n]
  }
}
