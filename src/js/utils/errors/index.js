import _ from 'lodash';
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
 * @param cb
 * @returns {Function}
 */
export function uncaughtExceptionHandler (cb = _.noop) {
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
