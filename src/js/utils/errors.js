import _ from 'lodash';
import StackTrace from 'stacktrace-js';
import StackFrame from 'stackframe';

/**
 * @param {Error} err
 * @returns {{}}
 */
export function errorToJSON (err = new Error) {
  const { name = '', message = '', stack } = err;

  return Object.assign({}, { name, message, stack }, err);
}

/**
 * @param {Error|Event} err
 * @returns {[]}
 */
export async function getStackFrames (err) {
  let stackframes = [];

  if (err instanceof Error) {
    try {
      stackframes = await StackTrace.fromError(err);
    } catch (err) {
      stackframes = [];
    }
  } else {
    const { filename, lineno, colno } = err;
    stackframes = [new StackFrame({ filename, lineno, colno, })];
  }

  return stackframes;
}

/**
 * @param {Function} cb
 * @returns {uncaughtExceptionCallback}
 */
export function uncaughtExceptionHandler (cb = _.noop) {
  /**
   * @callback uncaughtExceptionCallback
   * @param {ErrorEvent|Event} event
   * @param {Error} [err]
   */
  return function (event) {
    const { message } = event;

    setImmediate(async function () {
      let stackframes;

      if (event.error instanceof Error) {
        stackframes = await getStackFrames(event.error);
      } else {
        event.error = new Error(message);
        stackframes = await getStackFrames(event);
      }

      event.error.stackframes = stackframes;

      cb(event);
    });
  };
}

/**
 * @param {Function} cb
 * @returns {unhandledRejectionCallback}
 */
export function unhandledRejectionHandler (cb = _.noop) {
  /**
   * @callback unhandledRejectionCallback
   * @param {PromiseRejectionEvent|Event} event
   */
  return function (event) {
    setImmediate(async function () {
      const { reason } = event;

      let stackframes = [];

      if (reason instanceof Error) {
        stackframes = await getStackFrames(reason);
      } else {
        event.reason = new Error(reason);
      }

      event.reason.stackframes = stackframes;

      cb(event);
    });
  };
}
