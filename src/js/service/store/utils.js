import _ from 'lodash';
import Vue from 'vue';

export function resetState (state, defaults = {}) {
  // очистим state
  Object.keys(state).forEach(key => delete state[key]);
  // забъём его реактивными данными
  Object.keys(defaults).forEach(key => Vue.set(state, key, _.cloneDeep(defaults[key])));
}
