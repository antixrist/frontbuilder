import _ from 'lodash';
import StackTrace from 'stacktrace-js';
import StackFrame from 'stackframe';

/**
 * @param {Error|TypeError|SyntaxError|URIError|ReferenceError|RangeError|RangeError|EvalError} err - input err
 * @returns {?String} err type
 */
function typeName (err) {
  const found = _.find([
    [TypeError, 'TypeError'],
    [SyntaxError, 'SyntaxError'],
    [ReferenceError, 'ReferenceError'],
    [RangeError, 'RangeError'],
    [URIError, 'URIError'],
    [EvalError, 'EvalError'],
    [Error, 'Error']
  ], ([Ctor, name]) => err instanceof Ctor);
  
  return found ? found[1] : null;
}

/**
 *
 *
 * @link https://github.com/kgryte/utils-error-to-json
 * @param {Error} err
 * @returns {{}}
 */
export function errorToJSON (err) {
  if (!(err instanceof Error)) {
    if (_.isObjectLike(err) && !_.isArray(err)) {
      return _.assignIn({}, err);
    } else {
      throw new TypeError( 'invalid input argument. Must provide an error object. Value: `' + err + '`.' );
    }
  }
  
  const out = {};
  
  // Guaranteed properties:
  out.type = typeName(err);
  out.message = err.message;
  
  // Possible general error properties...
  if (err.name) {
    out.name = err.name;
  }
  if (err.stack) {
    out.stack = err.stack;
  }
  // Possible Node.js (system error) properties...
  if (err.code) {
    out.code = err.code;
  }
  if (err.errno) {
    out.errno = err.errno;
  }
  if (err.syscall) {
    out.syscall = err.syscall;
  }
  
  // Any properties...
  _.assignIn(out, err);
  
  return out;
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
export function getErrorFromUncaughtException (cb = _.noop) {
  /**
   * @callback uncaughtExceptionCallback
   * @param {ErrorEvent|Event} event
   * @param {Error} [err]
   */
  return function (event) {
    const { message = '' } = event;

    const err = (event.error instanceof Error) ? event.error : new Error(message);

    return _.isFunction(cb) ? cb(err) : err;
  };
}

/**
 * @param {Function} cb
 * @returns {unhandledRejectionCallback}
 */
export function getErrorFromUnhandledRejection (cb = _.noop) {
  /**
   * @callback unhandledRejectionCallback
   * @param {PromiseRejectionEvent|Event} event
   */
  return function (event) {
    const { reason: message } = event;

    const err = (event.reason instanceof Error) ? event.reason : new Error(message);

    return _.isFunction(cb) ? cb(err) : err;
  };
}
