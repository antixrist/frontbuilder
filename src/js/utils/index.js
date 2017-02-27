
export function assert (condition = true, message = '') {
  if (!condition && message) {
    throw new Error(`${message}`)
  }
}

export function warn (condition = true, message = '') {
  if (!condition && message) {
    typeof console !== 'undefined' && console.warn(`${message}`)
  }
}
