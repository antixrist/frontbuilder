import _ from 'lodash';

/**
 * @param {{}} bindings
 * @param {{}} [opts]
 * @returns {{}}
 *
 * @example
 * new Vue({
 *  store,
 *  mixins: [
 *    mapStateToMethods({
 *      'path.to.local.data': 'saveStateToStore'
 *    })
 *  ]
 * });
 */
export default function (bindings = {}, opts = {}) {
  const watchers = {};

  _.forEach(bindings, (methodName, path) => {
    let config = {};
    let config = {};
    if (_.isPlainObject(methodName)) {

    }

    watchers[path] = (() => {
      const res = {};

      return {
        immediate: true,
          handler (val) {
          this[methodName](val);
        }
      };
    })();
  });

  return watchers;
}