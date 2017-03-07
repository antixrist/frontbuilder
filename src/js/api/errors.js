import inherits from 'inherits';
import statuses from 'statuses';
import createErrors from 'create-error';
import ExtendableError from 'es6-error';
import setPrototypeOf from 'setprototypeof';


const ErrorSubclass = function ErrorSubclass(message) {
  Error.call(this, message);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    Object.defineProperty(this, 'stack', {value: (new Error()).stack});
  }

  Object.defineProperty(this, 'message', {value: message});
  Object.defineProperty(this, 'name', {value: this.constructor.name});
};

ErrorSubclass.prototype = Object.create(Error.prototype);
ErrorSubclass.prototype.toString = function toString() {
  return `${this.name}: ${this.message}`;
};

inherits(ErrorSubclass, Error);

window.ExtendableError = ExtendableError;
window.ErrorSubclass = ErrorSubclass;

/**
 * Heavy inspired by `http-errors`
 */

class NetworkError extends ExtendableError {
  constructor (message = 'Default message') {
    super(message);
  }
}

function HttpError (message) {
  message = message || 'Default message';
  ExtendableError.call(this, message);
}
inherits(HttpError, ExtendableError);

function ServerError (message) {
  message = message || 'Default message';
  ExtendableError.call(this, message);
}
inherits(ServerError, HttpError);

function ClientError (message) {
  message = message || 'Default message';
  ExtendableError.call(this, message);
}
inherits(ClientError, HttpError);


function createErrorConstructor (HttpError, name, code) {
  const className = name.match(/Error$/) ? name : name + 'Error';

  function ClientError (message) {
    // create the error object
    const msg = message != null ? message : statuses[code];
    const err = new Error(msg);

    // capture a stack trace to the construction point
    Error.captureStackTrace(err, ClientError);

    // adjust the [[Prototype]]
    setPrototypeOf(err, ClientError.prototype);

    // redefine the error message
    Object.defineProperty(err, 'message', {
      enumerable: true,
      configurable: true,
      value: msg,
      writable: true
    });

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err;
  }

  inherits(ClientError, HttpError);

  ClientError.prototype.status = code;
  ClientError.prototype.statusCode = code;

  return ClientError;
}



window.NetworkError = NetworkError;
window.CustomError = CustomError;
window.PropertyError = PropertyError;

// общего вида "наша" ошибка
function CustomError(message) {
  this.name = "CustomError";
  this.message = message;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

}

CustomError.prototype = Object.create(Error.prototype);
CustomError.prototype.constructor = CustomError;
CustomError.prototype.name = 'CustomError';

// наследник
function PropertyError(property) {
  CustomError.call(this, "Отсутствует свойство " + property)
  this.name = "PropertyError";
  this.property = property;
}

PropertyError.prototype = Object.create(CustomError.prototype);
PropertyError.prototype.constructor = PropertyError;
PropertyError.prototype.name = 'PropertyError';



/*!
 * http-errors
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2016 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var deprecate = require('depd')('http-errors');
// var setPrototypeOf = require('setprototypeof');

const errors = {};

/**
 * Module exports.
 * @public
 */
export default errors;
export { createError };
const HttpError = createHttpErrorConstructor();

// Populate exports for all constructors
populateConstructorExports(errors, statuses.codes, HttpError);


const _errors = {
  NotFound: class extends NetworkError {
    constructor (message = 'Default message') {
      super(message);
    }
  },
  Forbidden: createServerErrorConstructor(HttpError, 'ForbiddenError', 403)
};

window.createErrors = createErrors;
window.httpClasses = errors;
window._httpClasses = _errors;


/**
 * Create a new HTTP Error.
 *
 * @returns {Error}
 * @public
 */
function createError () {
  // so much arity going on ~_~
  let err;
  let msg;
  let status = 500;
  let props = {};
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    if (arg instanceof Error) {
      err = arg;
      status = err.status || err.statusCode || status;
      continue
    }
    switch (typeof arg) {
      case 'string':
        msg = arg;
        break;
      case 'number':
        status = arg;
        if (i !== 0) {
          deprecate('non-first-argument status code; replace with createError(' + arg + ', ...)')
        }
        break;
      case 'object':
        props = arg;
        break
    }
  }

  if (typeof status === 'number' && (status < 400 || status >= 600)) {
    deprecate('non-error status code; use only 4xx or 5xx status codes');
  }

  if (typeof status !== 'number' ||
    (!statuses[status] && (status < 400 || status >= 600))
  ) {
    status = 500;
  }

  // constructor
  const HttpError = createError[status] || createError[codeClass(status)];

  if (!err) {
    // create error
    err = HttpError
      ? new HttpError(msg)
      : new Error(msg || statuses[status]);
    Error.captureStackTrace(err, createError);
  }

  if (!HttpError || !(err instanceof HttpError) || err.status !== status) {
    // add properties to generic error
    err.expose = status < 500;
    err.status = err.statusCode = status;
  }

  for (let key in props) {
    if (key !== 'status' && key !== 'statusCode') {
      err[key] = props[key];
    }
  }

  return err;
}

/**
 * Create HTTP error abstract base class.
 * @private
 */
function createHttpErrorConstructor () {
  function HttpError () {
    throw new TypeError('cannot construct abstract class');
  }

  inherits(HttpError, Error);

  return HttpError;
}

/**
 * Create a constructor for a client error.
 * @private
 */
function createClientErrorConstructor (HttpError, name, code) {
  const className = name.match(/Error$/) ? name : name + 'Error';

  function ClientError (message) {
    // create the error object
    const msg = message != null ? message : statuses[code];
    const err = new Error(msg);

    // capture a stack trace to the construction point
    Error.captureStackTrace(err, ClientError);

    // adjust the [[Prototype]]
    setPrototypeOf(err, ClientError.prototype);

    // redefine the error message
    Object.defineProperty(err, 'message', {
      enumerable: true,
      configurable: true,
      value: msg,
      writable: true
    });

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err;
  }

  inherits(ClientError, HttpError);

  ClientError.prototype.status = code;
  ClientError.prototype.statusCode = code;

  return ClientError;
}

/**
 * Create a constructor for a server error.
 * @private
 */
function createServerErrorConstructor (HttpError, name, code) {
  const className = name.match(/Error$/) ? name : name + 'Error';

  function ServerError (message) {
    // create the error object
    const msg = message != null ? message : statuses[code];
    const err = new Error(msg);

    // capture a stack trace to the construction point
    Error.captureStackTrace(err, ServerError);

    // adjust the [[Prototype]]
    setPrototypeOf(err, ServerError.prototype);

    // redefine the error message
    Object.defineProperty(err, 'message', {
      enumerable: true,
      configurable: true,
      value: msg,
      writable: true
    });

    // redefine the error name
    Object.defineProperty(err, 'name', {
      enumerable: false,
      configurable: true,
      value: className,
      writable: true
    });

    return err;
  }

  inherits(ServerError, HttpError);

  ServerError.prototype.status = code;
  ServerError.prototype.statusCode = code;

  return ServerError;
}

/**
 * Populate the exports object with constructors for every error class.
 * @private
 */
function populateConstructorExports (exports, codes, HttpError) {
  codes.forEach(function forEachCode (code) {
    let CodeError;
    const name = toIdentifier(statuses[code]);

    switch (codeClass(code)) {
      case 400:
        CodeError = createClientErrorConstructor(HttpError, name, code);
        break;
      case 500:
        CodeError = createServerErrorConstructor(HttpError, name, code);
        break;
    }

    if (CodeError) {
      // export the constructor
      exports[code] = CodeError;
      exports[name] = CodeError;
    }
  });
}

/**
 * Convert a string of words to a JavaScript identifier.
 * @private
 */
function toIdentifier (str) {
  return str.split(' ').map(function (token) {
    return token.slice(0, 1).toUpperCase() + token.slice(1);
  }).join('').replace(/[^ _0-9a-z]/gi, '');
}

/**
 * Get the code class of a status code.
 * @private
 */
function codeClass (status) {
  return Number(String(status).charAt(0) + '00');
}




// // Просто интерфейс
// class HttpError extends ExtendableError {
//   constructor (code, message = 'Default message') {
//     super(message);
//
//     this.status = err.status || err.statusCode || status
//   }
// }
// /**
//  * Create HTTP error abstract base class.
//  * @private
//  */
//
// function createHttpErrorConstructor () {
//   function HttpError () {
//     throw new TypeError('cannot construct abstract class')
//   }
//
//   inherits(HttpError, Error);
//
//   return HttpError
// }
//
// class ClientError extends HttpError {
//   constructor (code, message = 'Default message') {
//     super(message);
//   }
// }
//
// class ServerError extends HttpError {
//   constructor (code, message = 'Default message') {
//     super(message);
//   }
// }

// module.exports = (() => {
//   return {};
// })();

// function MyError(message) {
//   message = message || 'Default message';
//   ExtendableError.call(this, message);
// }
//
// util.inherits(MyError, ExtendableError);
//
// module.exports = MyError;




// /**
//  * Get the code class of a status code.
//  * @private
//  */
//
// function codeClass (status) {
//   return Number(String(status).charAt(0) + '00')
// }
//
// /**
//  * Convert a string of words to a JavaScript identifier.
//  * @private
//  */
//
// function toIdentifier (str) {
//   return str.split(' ').map(function (token) {
//     return token.slice(0, 1).toUpperCase() + token.slice(1)
//   }).join('').replace(/[^ _0-9a-z]/gi, '')
// }
//
// /**
//  * Populate the exports object with constructors for every error class.
//  * @private
//  */
//
// function populateConstructorExports (exports, codes, HttpError) {
//   codes.forEach(function forEachCode (code) {
//     var CodeError;
//     var name = toIdentifier(statuses[code]);
//
//     switch (codeClass(code)) {
//       case 400:
//         CodeError = createClientErrorConstructor(HttpError, name, code);
//         break;
//       case 500:
//         CodeError = createServerErrorConstructor(HttpError, name, code);
//         break;
//     }
//
//     if (CodeError) {
//       // export the constructor
//       exports[code] = CodeError;
//       exports[name] = CodeError;
//     }
//   });
// }
