/**
 * https://github.com/vuejs/vuex/issues/335#issuecomment-250224136
 */

/**
 * @param {{}} obj
 * @param {Function} f
 * @returns {{}}
 */
function mapValues (obj, f) {
  const res = {};
  Object.keys(obj).forEach(key => {
    res[key] = f(obj[key], key)
  });
  return res
}

/**
 * @param {string} module
 * @param {{}} types
 * @param {string} [separator]
 * @returns {{}}
 */
function namespace (module, types, separator = ':') {
  let newObj = {};

  mapValues(types, (names, type) => {
    newObj[type] = {};
    types[type].forEach(name=> {
      newObj[type][name] = [module, name].join(separator);
    });
  });
  return newObj;
}


export default { namespace };
