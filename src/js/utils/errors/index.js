import { noop } from '../';
import StackTrace from 'stacktrace-js';
import StackFrame from 'stackframe';

/**
 * @returns {[]}
 */
export async function getErrorStackFrames (...args) {
  let stackframes = [];

  if (args.length == 1) {
    try {
      stackframes = await StackTrace.fromError(args[0]);
    } catch (err) {
      stackframes = [];
    }
  } else {
    const [fileName, lineNumber, columnNumber] = args;
    stackframes = [new StackFrame({
      fileName,
      lineNumber,
      columnNumber,
    })];
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
   * @param {string} fileName
   * @param {number} lineNumber
   * @param {number} columnNumber
   * @param {Error} [err]
   */
  return function (msg, fileName, lineNumber, columnNumber, err) {
    setImmediate(async function () {
      let stackframes;

      if (err) {
        stackframes = await getErrorStackFrames(err);
      } else {
        err = new Error(msg);
        stackframes = await getErrorStackFrames(msg, fileName, lineNumber, columnNumber);
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
      const { reason, promise } = event;

      let stackframes = [];

      if (reason instanceof Error) {
        stackframes = await getErrorStackFrames(reason);
      } else {
        event.reason = new Error(reason);
      }

      event.stackframes = stackframes;

      cb(event);
    });

    return true;
  };
}
