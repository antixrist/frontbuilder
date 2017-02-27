
export function assert (condition = true, message = '') {
  if (!condition && message) {
    throw new Error(`[app] ${message}`)
  }
}

export function warn (condition = true, message = '') {
  if (!condition && message) {
    typeof console !== 'undefined' && console.warn(`[app] ${message}`)
  }
}
