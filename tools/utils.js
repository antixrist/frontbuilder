import * as _ from 'lodash';

/**
 * @param {*} input
 * @returns {*[]}
 */
export function toArray (input) {
  input = !!input ? input : [];
  input = _.isArray(input) ? input : [input];
  
  return input;
}
