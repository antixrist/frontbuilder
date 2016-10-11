/**
 * https://github.com/vuejs/vuex/issues/335#issuecomment-250224136
 *
```javascript
 // types.js
 import {namespace} from './utils';
 export default namespace('auth', {
   getters: [
     'user'
   ],
   actions: [
     'fetchUser'
   ],
   mutations: [
     'receiveUser'
   ]
 });

 // module.js
 import * as accountApi from 'api/account'
 import types from './types'

 const state = {
   user: null
 }

 const actions = {
   [types.actions.fetchUser]: context => {
     return accountApi.me().then(response => {
       context.commit(types.mutations.receiveUser, response)
     });
   }
 }

 const getters = {
   [types.getters.user]: state => state.user
 }

 const mutations = {
   [types.mutations.receiveUser]: (state, apiResponse) => {
     state.user = apiResponse.payload;
   }
 }

 export default {
   state,
   actions,
   getters,
   mutations
 };
```
 *
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
