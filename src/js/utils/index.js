import _ from 'lodash';
import Vue from 'vue';
export * from './errors';

/**
 * @param {boolean} condition
 * @param {string} message
 */
export function assert (condition = true, message = '') {
  if (!condition && message) {
    const err = new Error(`${message}`);
    err.isAssertFailed = true;
    throw err;
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
