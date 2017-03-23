import _ from 'lodash';
import Vue from 'vue';

export function resetState (state, defaults = {}) {
  // очистим state
  Object.keys(state).forEach(key => delete state[key]);
  // забъём его реактивными данными
  Object.keys(defaults).forEach(key => Vue.set(state, key, _.cloneDeep(defaults[key])));
}

/**
 * Функция нужна, чтобы безопасно дополнить объект не теряя ссылку на него.
 *
 * Смысл в том, что у уже существующих ключей есть vue-шные геттеры и сеттеры
 * и значение у такого ключа можно спокойно перезаписывать.
 * А вот несуществующие надо устанавливать через Vue.set
 *
 * @param data
 * @param updates
 */
export function assignToReactive (data = {}, updates = {}) {
  Object.keys(updates).forEach(key => {
    const val = updates[key];

    if (typeof data[key] == 'undefined') {
      Vue.set(data, key, val);
    } else {
      data[key] = val;
    }
  });
}
