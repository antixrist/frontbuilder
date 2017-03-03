import * as _ from 'lodash';

/**
 * @param {{}|function} input
 * @returns {Function}
 */
export function runOrReturn (input) {
  const fn = (typeof input != 'function')
    ? function () { return input; }
    : input
  ;

  return function () {
    return fn.call(this, ...arguments);
  };
}

/**
 * Возвращает массив.
 * Если аргумент был один и он ложный, то вернётся пустой массив.
 *
 * @param any...
 * @returns {[]}
 */
export function toArray (...any) {
  let retVal = _.flatten(any);
  return (retVal.length === 1 && !retVal[0]) ? [] : retVal;
}
