/**
 * Здесь собираем в кучу и настраиваем все части приложения, соединяем их между собой.
 * обращений к window здесь быть не должно
 */

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { sync } from 'vuex-router-sync';
import * as filters from './filters';
import * as directives from './directives';
import * as services from '../service';
import '../../styles/main.scss';


// import 'vue-flatpickr/theme/airbnb.css';
import 'vue-flatpickr/theme/base16_flat.css';
// import 'vue-flatpickr/theme/confetti.css';
// import 'vue-flatpickr/theme/dark.css';
// import 'vue-flatpickr/theme/material_blue.css';
// import 'vue-flatpickr/theme/material_green.css';
// import 'vue-flatpickr/theme/material_orange.css';
// import 'vue-flatpickr/theme/material_red.css';
import VueFlatpickr from 'vue-flatpickr';

Vue.use(VueFlatpickr);


const { storage, store, api, http, progress, bus } = services;

/** Стор и роутер */
sync(store, router);

/** Внедряем сервисы */
// Object.keys(services).forEach(service => {
//   if (service == 'store') { return; }
//
//   Object.defineProperty(Vue.prototype, `$${service}`, {
//     get () { return services[service]; }
//   });
// });

Object.defineProperties(Vue.prototype, {
  $api: {
    get () { return api; }
  },
  $http: {
    get () { return http; }
  },
  $bus: {
    get () { return bus; }
  },
  $storage: {
    get () { return storage; }
  },
  $progress: {
    get () { return progress; }
  }
});

/** Устанавливаем фильтры и директивы */
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

Object.keys(directives).forEach(key => {
  Vue.directive(key, directives[key])
});

/**
 * если вызвать этот метод внутри компонента `this.$reset()`,
 * то внутри компонента все данные будут установлены в init-данные,
 * при условии, что `data` была определена как функция (иначе сброса не будет)
 */
Vue.prototype.$reset = function () {
  const dataFn = typeof this.$options.data == 'function' ? this.$options.data : () => this.$options.data;
  const data = dataFn();

  Object.keys(data).forEach(key => this[key] = data[key]);
};

/** Инcтанс */
const app = new Vue({
  router,
  store,
  ...App
});

/** выплёвываем его наружу (монтирование приложения снаружи, надо оно или не надо - всё там) */
export { app, store, router };
