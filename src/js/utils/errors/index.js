import { noop } from '../';
import StackTrace from 'stacktrace-js';
import StackFrame from 'stackframe';

/**
 * @param {Error|{file: String, line: Number, column: Number}} err
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
    const { file, line, column } = err;
    stackframes = [new StackFrame({ file, line, column, })];
  }

  return stackframes;
}

/**
 * @param {Function} cb
 * @returns {uncaughtExceptionCallback}
 */
export function uncaughtExceptionHandler (cb = noop) {
  /**
   * @callback uncaughtExceptionCallback
   * @param {string} msg
   * @param {string} file
   * @param {number} line
   * @param {number} column
   * @param {Error} [err]
   */
  return function (msg, file, line, column, err) {
    setImmediate(async function () {
      let stackframes;

      if (err) {
        stackframes = await getStackFrames(err);
      } else {
        err = new Error(msg);
        stackframes = await getStackFrames({ file, line, column });
      }

      err.stackframes = stackframes;

      cb(err);
    });

    return true;
  };
}

/**
 * @param {Function} cb
 * @returns {unhandledRejectionCallback}
 */
export function unhandledRejectionHandler (cb = noop) {
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

      event.stackframes = stackframes;

      cb(event);
    });

    return true;
  };
}
