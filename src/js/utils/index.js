export * from './errors';

/**
 * @param {boolean} condition
 * @param {string} message
 */
export function assert (condition = true, message = '') {
  if (!condition && message) {
    throw new Error(`${message}`)
  }
}

/**
 * @param {boolean} condition
 * @param {string} message
 */
export function warn (condition = true, message = '') {
  if (!condition && message) {
    typeof console !== 'undefined' && console.warn(`${message}`)
  }
}

/**
 * @param el
 * @param {string} event
 * @param {Function} cb
 */
export function addOnceEventListener (el, event, cb) {
  const once = (e) => {
    cb(e);
    el.removeEventListener(event, once, false);
  };

  el.addEventListener(event, once, false)
}
