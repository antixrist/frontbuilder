import Vue from 'vue';
import store from './store';
import router from './router';

import {sync} from 'vuex-router-sync';
sync(store, router);

const app = new Vue({
  router,
  store,
});

export {app, router, store};

/**
 * todo:
 *
 * Пример dropdown'а на tether'е
 * https://github.com/JosephusPaye/Keen-UI/blob/gh-pages/src/mixins/ShowsDropdown.js
 * https://github.com/JosephusPaye/Keen-UI/blob/gh-pages/src/UiMenu.vue
 * https://github.com/JosephusPaye/Keen-UI/blob/gh-pages/src/UiPopover.vue
 */
