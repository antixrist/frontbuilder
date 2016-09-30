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



async function qweqwe () {
  return await Promise.delay(100).then(() => Promise.resolve('asdqweasd'))
}

qweqwe()
  .then(b => console.log(b))
  // .finally(() => console.log('finally'))
;