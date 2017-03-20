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

// /**
//  * @param {Error} err
//  */
// export function logError (err) {
//   // #6d3400
//   const style = 'background: rgba(255, 255, 0, 0.04); color: red;';
//
//   if (!(err instanceof Error)) {
//     console.log(...arguments);
//     return;
//   }
//
//   const now = new Date;
//
//   let prefixes = [];
//   prefixes.push(`[${[
//     _.padStart(now.getHours(), 2, '0'),
//     _.padStart(now.getMinutes(), 2, '0'),
//     _.padStart(now.getSeconds(), 2, '0')
//   ].join(':')}.${ now.getMilliseconds() }]`);
//
//   if (err.name) {
//     prefixes.push(`[${ err.name }]`);
//   }
//
//   prefixes = prefixes.join(' ');
//   prefixes = prefixes ? `${ prefixes }: ` : '';
//
//   console.group && console.group(`%c${ prefixes }${ err.message }`, style);
//   console.log(err.stack);
//   console.groupEnd && console.groupEnd();
// }
